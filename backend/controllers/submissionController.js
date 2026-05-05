const { Submission, Language, ExecutionResult } = require('../models');
const { executeCode } = require('../services/executionService');

exports.createSubmission = async (req, res) => {
  try {
    const { languageId, code } = req.body;
    const userId = req.user.id;

    const language = await Language.findByPk(languageId);
    if (!language) {
      return res.status(400).json({ error: 'Invalid language ID.' });
    }

    const submission = await Submission.create({
      userId,
      languageId,
      code,
      status: 'queued'
    });

    // Queue execution asynchronously
    executeCode(submission.id).catch(console.error);

    res.status(201).json({ message: 'Submission queued successfully', submissionId: submission.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findOne({
      where: { id, userId },
      include: [
        { model: Language, as: 'language', attributes: ['name', 'version'] },
        { model: ExecutionResult, as: 'result' }
      ]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const submissions = await Submission.findAll({
      where: { userId },
      include: [
        { model: Language, as: 'language', attributes: ['name', 'version'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
