const promClient = require('prom-client');

const codeExecutionsTotal = new promClient.Counter({
  name: 'code_executions_total',
  help: 'Total number of code executions',
  labelNames: ['language', 'status']
});

const codeExecutionTimeSeconds = new promClient.Histogram({
  name: 'code_execution_time_seconds',
  help: 'Time taken to execute code in seconds',
  labelNames: ['language'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

module.exports = {
  codeExecutionsTotal,
  codeExecutionTimeSeconds
};
