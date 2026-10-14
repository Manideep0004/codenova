const http = require('http');

function post(url, body, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, data: d });
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'GET',
      headers
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch (e) {
          resolve({ status: res.statusCode, data: d });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runTest(base, token, name, languageId, code, stdin) {
  console.log(`\n========================================`);
  console.log(`TESTING: ${name} (Lang ID: ${languageId})`);
  console.log(`========================================`);
  const t0 = Date.now();
  const subRes = await post(base + '/submissions', { languageId, code, stdin: stdin || '' }, token);
  if (subRes.status !== 202) {
    console.error(`Submission failed:`, subRes);
    return;
  }
  const subId = subRes.data.submissionId;
  console.log(`Submission queued with ID: ${subId}. Awaiting sandbox execution...`);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const poll = await get(base + '/submissions/' + subId, token);
    const st = poll.data?.status;
    process.stdout.write(`[${st}] `);
    if (st === 'completed' || st === 'failed') {
      console.log(`\nResult for ${name}:`);
      console.log(`- Exit Code: ${poll.data.result?.exitCode}`);
      console.log(`- Execution Time: ${poll.data.result?.executionTime} ms`);
      console.log(`- Memory Used: ${poll.data.result?.memoryUsed} KB`);
      console.log(`- Total Roundtrip: ${Date.now() - t0} ms`);
      if (poll.data.result?.stdout) console.log(`STDOUT:\n${poll.data.result.stdout}`);
      if (poll.data.result?.stderr) console.log(`STDERR:\n${poll.data.result.stderr}`);
      return;
    }
  }
  console.log(`\nTimeout waiting for submission ${subId}`);
}

async function main() {
  const base = 'http://a48d1e02af93040df93d65bdcd9ddda6-1712028144.ap-southeast-2.elb.amazonaws.com:5000/api';
  console.log('Logging in as admin...');
  const loginRes = await post(base + '/auth/login', { email: 'admin@codenova.io', password: 'Admin@123' });
  const token = loginRes.data.token;
  console.log('Logged in successfully!');

  // Test 1: Python with custom Stdin
  await runTest(
    base,
    token,
    'Python 3.11 with Stdin',
    1,
    'import sys\nname = sys.stdin.read().strip()\nprint(f"Hello, {name}! Secure Python execution complete.")',
    'Manideep Gudiya'
  );

  // Test 2: Node.js JavaScript
  await runTest(
    base,
    token,
    'JavaScript Node.js 18',
    4,
    'const crypto = require("crypto");\nconst hash = crypto.createHash("sha256").update("codenova").digest("hex");\nconsole.log("SHA-256 Hash:", hash);\nconsole.log("Platform:", process.platform, process.arch);',
    ''
  );

  // Test 3: C++20
  await runTest(
    base,
    token,
    'C++20 (GCC 12)',
    3,
    '#include <iostream>\n#include <vector>\n#include <numeric>\nusing namespace std;\nint main() {\n    vector<int> v = {10, 20, 30, 40};\n    int sum = accumulate(v.begin(), v.end(), 0);\n    cout << "C++20 Vector Sum: " << sum << endl;\n    return 0;\n}',
    ''
  );
}

main().catch(console.error);
