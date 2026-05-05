const { executeCode } = require('../services/executionService');
const { Submission, ExecutionResult, Language } = require('../models');
const Docker = require('dockerode');

jest.mock('../models', () => ({
  Submission: {
    findByPk: jest.fn(),
    update: jest.fn()
  },
  ExecutionResult: {
    create: jest.fn()
  },
  Language: {}
}));
jest.mock('dockerode');

describe('Execution Service', () => {
  let mockContainer;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContainer = {
      start: jest.fn().mockResolvedValue(true),
      wait: jest.fn().mockResolvedValue({ StatusCode: 0 }),
      logs: jest.fn().mockResolvedValue(Buffer.from('010000000000000C48656C6C6F20576F726C640A', 'hex')),
      kill: jest.fn().mockResolvedValue(true),
      remove: jest.fn().mockResolvedValue(true),
    };

    Docker.prototype.createContainer = jest.fn().mockResolvedValue(mockContainer);
  });

  it('should execute code and save the result successfully', async () => {
    const mockSubmission = {
      id: 1,
      code: 'print("Hello World")',
      language: { name: 'Python' },
      update: jest.fn().mockResolvedValue(true)
    };

    Submission.findByPk.mockResolvedValue(mockSubmission);
    ExecutionResult.create.mockResolvedValue(true);

    await executeCode(1);

    expect(Submission.findByPk).toHaveBeenCalledWith(1, { include: [expect.anything()] });
    expect(Docker.prototype.createContainer).toHaveBeenCalled();
    expect(mockContainer.start).toHaveBeenCalled();
    expect(mockContainer.wait).toHaveBeenCalled();
    expect(ExecutionResult.create).toHaveBeenCalledWith(expect.objectContaining({
      submissionId: 1,
      stdout: 'Hello World\n',
      exitCode: 0
    }));
    expect(mockSubmission.update).toHaveBeenCalledWith({ status: 'completed' });
    expect(mockContainer.remove).toHaveBeenCalledWith({ force: true });
  });

  it('should handle execution timeout', async () => {
    const mockSubmission = {
      id: 1,
      code: 'while True: pass',
      language: { name: 'Python' },
      update: jest.fn().mockResolvedValue(true)
    };

    Submission.findByPk.mockResolvedValue(mockSubmission);
    ExecutionResult.create.mockResolvedValue(true);

    // Mock setTimeout for timeout simulation
    jest.spyOn(global, 'setTimeout').mockImplementation((cb) => cb());
    
    mockContainer.wait = jest.fn().mockReturnValue(new Promise(() => {}));

    await executeCode(1);

    expect(mockContainer.kill).toHaveBeenCalled();
    expect(ExecutionResult.create).toHaveBeenCalledWith(expect.objectContaining({
      submissionId: 1,
      stderr: 'Execution Timeout',
      exitCode: 124
    }));
    expect(Submission.update).toHaveBeenCalledWith({ status: 'failed' }, { where: { id: 1 } });
    
    global.setTimeout.mockRestore();
  });
});
