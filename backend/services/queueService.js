// backend/services/queueService.js
const Bull = require('bull');
const logger = require('../utils/logger');
const { queueDepthGauge } = require('../utils/metrics');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;

let executionQueue;
let redisAvailable = false;

if (process.env.NODE_ENV !== 'test') {
  try {
  executionQueue = new Bull('code-execution', {
    redis: {
      host: redisHost,
      port: redisPort,
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy: (times) => {
        if (times > 3) {
          return null; // Stop retrying after 3 attempts
        }
        return Math.min(times * 500, 2000);
      }
    },
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: true,
      removeOnFail: false
    }
  });

  executionQueue.on('ready', () => {
    redisAvailable = true;
    logger.info(`Bull Queue connected to Redis at ${redisHost}:${redisPort}`);
  });

  executionQueue.on('error', (err) => {
    logger.warn(`Bull Queue Redis warning: ${err.message}`);
  });
  } catch (err) {
    logger.warn(`Failed to initialize Bull Queue: ${err.message}`);
  }
}

const enqueueSubmission = async (submissionId) => {
  if (executionQueue && redisAvailable) {
    const job = await executionQueue.add({ submissionId });
    updateQueueMetrics().catch(() => {});
    return job.id;
  }
  return null;
};

const getQueueMetrics = async () => {
  if (!executionQueue || !redisAvailable) {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  }
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      executionQueue.getWaitingCount(),
      executionQueue.getActiveCount(),
      executionQueue.getCompletedCount(),
      executionQueue.getFailedCount(),
      executionQueue.getDelayedCount()
    ]);
    return { waiting, active, completed, failed, delayed };
  } catch (err) {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  }
};

const updateQueueMetrics = async () => {
  try {
    const counts = await getQueueMetrics();
    if (queueDepthGauge) {
      queueDepthGauge.set(counts.waiting + counts.active);
    }
  } catch (err) {}
};

module.exports = {
  executionQueue,
  enqueueSubmission,
  getQueueMetrics,
  updateQueueMetrics,
  isRedisAvailable: () => redisAvailable
};
