const { Submission, Language, ExecutionResult } = require('../models');
const { enqueueSubmission, isRedisAvailable } = require('../services/queueService');
const { executeCode } = require('../services/executionService');
const logger = require('../utils/logger');

exports.createSubmission = async (req, res) => {
  try {
    const { languageId, code, stdin } = req.body;
    const userId = req.user.id;

    const language = await Language.findByPk(languageId);
    if (!language || !language.isActive) {
      return res.status(400).json({ error: 'Selected programming language is invalid or disabled.' });
    }

    // Persist submission record with status: 'queued'
    const submission = await Submission.create({
      userId,
      languageId,
      code,
      stdinData: stdin || '',
      status: 'queued'
    });

    // Enqueue asynchronously to Bull Redis Queue
    if (isRedisAvailable()) {
      await enqueueSubmission(submission.id);
    } else {
      // Direct async worker fallback if standalone or Redis in-memory mode
      setImmediate(() => {
        executeCode(submission.id).catch((err) => {
          logger.error(`Direct execution fallback error: ${err.message}`);
        });
      });
    }

    // FR-04: Immediate HTTP 202 Accepted response for sub-100ms ingestion
    return res.status(202).json({
      message: 'Submission queued successfully',
      submissionId: submission.id,
      status: 'queued'
    });

  } catch (error) {
    logger.error(`createSubmission failed: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role?.name === 'admin' || req.user.roleId === 1;

    const whereClause = isAdmin ? { id } : { id, userId };

    const submission = await Submission.findOne({
      where: whereClause,
      include: [
        { model: Language, as: 'language', attributes: ['id', 'name', 'version', 'extension'] },
        { model: ExecutionResult, as: 'result' }
      ]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found or access denied.' });
    }

    return res.json(submission);
  } catch (error) {
    logger.error(`getSubmission error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const offset = (page - 1) * limit;

    const { count, rows: submissions } = await Submission.findAndCountAll({
      where: { userId },
      include: [
        { model: Language, as: 'language', attributes: ['id', 'name', 'version', 'extension'] },
        { model: ExecutionResult, as: 'result', attributes: ['stdout', 'stderr', 'exitCode', 'executionTime', 'memoryUsed'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return res.json({
      submissions,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit
      }
    });
  } catch (error) {
    logger.error(`getHistory error: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};
