const Docker = require('dockerode');
const { ExecutionResult, Submission, Language } = require('../models');
const docker = new Docker();

const IMAGES = {
  Python: 'python:3.11-slim',
  Java: 'eclipse-temurin:17-jdk-alpine',
  'C++': 'gcc:12',
  JavaScript: 'node:18-alpine'
};

const getCommands = (languageName, code) => {
  const base64Code = Buffer.from(code).toString('base64');
  switch (languageName) {
    case 'Python':
      return ['sh', '-c', `echo ${base64Code} | base64 -d > script.py && python3 script.py`];
    case 'JavaScript':
      return ['sh', '-c', `echo ${base64Code} | base64 -d > script.js && node script.js`];
    case 'C++':
      return ['sh', '-c', `echo ${base64Code} | base64 -d > main.cpp && g++ main.cpp -o main && ./main`];
    case 'Java':
      return ['sh', '-c', `echo ${base64Code} | base64 -d > Main.java && javac Main.java && java Main`];
    default:
      throw new Error(`Unsupported language: ${languageName}`);
  }
};

exports.executeCode = async (submissionId) => {
  let container;
  const startTime = Date.now();
  
  try {
    const submission = await Submission.findByPk(submissionId, { 
      include: [{ model: Language, as: 'language' }] 
    });
    
    if (!submission) throw new Error('Submission not found');
    await submission.update({ status: 'running' });

    const languageName = submission.language.name;
    const image = IMAGES[languageName];
    const cmds = getCommands(languageName, submission.code);

    container = await docker.createContainer({
      Image: image,
      Cmd: cmds,
      Tty: false,
      HostConfig: {
        Memory: 256 * 1024 * 1024, // 256 MB
        NanoCpus: 500000000, // 0.5 CPU
        NetworkMode: 'none',
        AutoRemove: false // Must be false to grab logs after execution
      }
    });

    await container.start();

    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Execution Timeout'));
      }, 10000); // 10 seconds timeout
    });

    const waitPromise = container.wait();
    
    const result = await Promise.race([waitPromise, timeoutPromise]);
    clearTimeout(timeoutId);

    const logs = await container.logs({ stdout: true, stderr: true });
    
    const stdout = [];
    const stderr = [];

    // Parse Docker multiplexed streams
    let offset = 0;
    while (offset < logs.length) {
      const type = logs[offset];
      const length = logs.readUInt32BE(offset + 4);
      const payload = logs.subarray(offset + 8, offset + 8 + length);
      if (type === 1) stdout.push(payload);
      else if (type === 2) stderr.push(payload);
      offset += 8 + length;
    }

    const stdoutText = Buffer.concat(stdout).toString('utf8');
    const stderrText = Buffer.concat(stderr).toString('utf8');
    const executionTime = Date.now() - startTime;

    await ExecutionResult.create({
      submissionId,
      stdout: stdoutText,
      stderr: stderrText,
      executionTime,
      memoryUsed: 0,
      exitCode: result.StatusCode
    });

    await submission.update({ status: result.StatusCode === 0 ? 'completed' : 'failed' });

  } catch (error) {
    let errMessage = error.message;
    if (container && errMessage === 'Execution Timeout') {
      try { await container.kill(); } catch (e) {}
    }
    
    await ExecutionResult.create({
      submissionId,
      stdout: '',
      stderr: errMessage,
      executionTime: Date.now() - startTime,
      memoryUsed: 0,
      exitCode: 124
    });

    await Submission.update({ status: 'failed' }, { where: { id: submissionId } });
  } finally {
    if (container) {
      try { await container.remove({ force: true }); } catch (e) {}
    }
  }
};
