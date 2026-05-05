const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, submissionController.createSubmission);
router.get('/history', authMiddleware, submissionController.getHistory);
router.get('/:id', authMiddleware, submissionController.getSubmission);

module.exports = router;
