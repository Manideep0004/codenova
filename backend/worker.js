// backend/worker.js
const { sequelize } = require('./models');
const { executionQueue, isRedisAvailable } = require('./services/queueService');
const { executeCode } = require('./services/executionService');
const logger = require('./utils/logger');

logger.info('Starting CodeNova Code Execution Worker...');

async function startWorker() {
  try {
    await sequelize.authenticate();
    logger.info('Worker: Connected to PostgreSQL database.');

    if (!executionQueue) {
      logger.error('Worker: Bull queue not initialized.');
      process.exit(1);
    }

    // Process queued execution tasks concurrently (up to 2 parallel sandboxes per worker)
    executionQueue.process(2, async (job) => {
      const { submissionId } = job.data;
      logger.info(`Worker dequeued submission #${submissionId}`);
      try {
        await executeCode(submissionId);
        logger.info(`Worker finished processing submission #${submissionId}`);
      } catch (err) {
        logger.error(`Worker error executing submission #${submissionId}: ${err.message}`);
        throw err;
      }
    });

    logger.info('Worker: Listening for execution jobs on Bull Redis queue...');

    const shutdown = async () => {
      logger.info('Worker shutting down gracefully...');
      if (executionQueue) {
        await executionQueue.close();
      }
      await sequelize.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error(`Worker startup failed: ${error.message}`);
    process.exit(1);
  }
}

startWorker();
