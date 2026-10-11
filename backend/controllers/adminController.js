const { User, Role, Submission, Language, ExecutionResult, sequelize } = require('../models');
const { getQueueMetrics } = require('../services/queueService');
const logger = require('../utils/logger');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'roleId', 'createdAt'],
      include: [
        { model: Role, as: 'role', attributes: ['id', 'name', 'description'] },
        { model: Submission, as: 'submissions', attributes: ['id'] }
      ],
      order: [['id', 'ASC']]
    });

    const userSummaries = users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role ? u.role.name : (u.roleId === 1 ? 'admin' : 'user'),
      roleId: u.roleId,
      submissionCount: u.submissions ? u.submissions.length : 0,
      createdAt: u.createdAt
    }));

    res.json(userSummaries);
  } catch (error) {
    logger.error(`admin getAllUsers error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.id === req.user.id && roleId !== 1) {
      return res.status(400).json({ error: 'Cannot revoke your own administrator role.' });
    }

    await user.update({ roleId });
    res.json({ message: 'User role updated successfully.', userId: user.id, roleId });
  } catch (error) {
    logger.error(`admin updateUserRole error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getSystemMetrics = async (req, res) => {
  try {
    const [totalUsers, totalSubmissions, completedSubmissions, failedSubmissions] = await Promise.all([
      User.count(),
      Submission.count(),
      Submission.count({ where: { status: 'completed' } }),
      Submission.count({ where: { status: 'failed' } })
    ]);

    const queueMetrics = await getQueueMetrics();

    // Query submissions by language
    const languageStats = await Submission.findAll({
      attributes: [
        'languageId',
        [sequelize.fn('COUNT', sequelize.col('Submission.id')), 'count']
      ],
      include: [{ model: Language, as: 'language', attributes: ['name'] }],
      group: ['languageId', 'language.id', 'language.name']
    });

    const recentSubmissions = await Submission.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['username'] },
        { model: Language, as: 'language', attributes: ['name'] },
        { model: ExecutionResult, as: 'result', attributes: ['executionTime', 'exitCode', 'memoryUsed'] }
      ]
    });

    res.json({
      overview: {
        totalUsers,
        totalSubmissions,
        completedSubmissions,
        failedSubmissions,
        successRate: totalSubmissions > 0 ? ((completedSubmissions / totalSubmissions) * 100).toFixed(1) + '%' : '100%'
      },
      queue: queueMetrics,
      languages: languageStats.map(s => ({
        language: s.language ? s.language.name : 'Unknown',
        count: parseInt(s.get('count'), 10)
      })),
      recentActivity: recentSubmissions
    });
  } catch (error) {
    logger.error(`admin getSystemMetrics error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
