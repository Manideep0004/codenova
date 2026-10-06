const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateBody, submissionSchema } = require('../middleware/validationMiddleware');

router.post('/', authMiddleware, validateBody(submissionSchema), submissionController.createSubmission);
router.get('/history', authMiddleware, submissionController.getHistory);
router.get('/:id', authMiddleware, submissionController.getSubmission);

module.exports = router;
