// backend/utils/metrics.js
const promClient = require('prom-client');

// Reusable metrics register
const register = promClient.register;

let codeExecutionsTotal;
let codeExecutionTimeSeconds;
let queueDepthGauge;
let httpRequestDurationSeconds;

try {
  codeExecutionsTotal = register.getSingleMetric('code_executions_total') || new promClient.Counter({
    name: 'code_executions_total',
    help: 'Total number of code executions',
    labelNames: ['language', 'status']
  });

  codeExecutionTimeSeconds = register.getSingleMetric('code_execution_time_seconds') || new promClient.Histogram({
    name: 'code_execution_time_seconds',
    help: 'Time taken to execute code in seconds',
    labelNames: ['language'],
    buckets: [0.1, 0.5, 1, 2, 5, 10]
  });

  queueDepthGauge = register.getSingleMetric('code_queue_depth') || new promClient.Gauge({
    name: 'code_queue_depth',
    help: 'Current number of active and queued execution tasks'
  });

  httpRequestDurationSeconds = register.getSingleMetric('http_request_duration_seconds') || new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2.5]
  });
} catch (e) {
  // Graceful fallback for metric re-declaration in hot reload
}

module.exports = {
  promClient,
  register,
  codeExecutionsTotal,
  codeExecutionTimeSeconds,
  queueDepthGauge,
  httpRequestDurationSeconds
};
