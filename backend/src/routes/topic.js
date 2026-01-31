import express from 'express';
import { body, validationResult } from 'express-validator';
import { getTopics, createTopic, updateTopic, deleteTopic, toggleTopicStatus } from '../controllers/topicController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// All routes are protected
router.use(protect);

// Topic routes
router.get('/', getTopics);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Topic name is required'),
  body('goalId').notEmpty().withMessage('Goal ID is required')
], validate, createTopic);

router.put('/:id', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('status').optional().isIn(['pending', 'completed']).withMessage('Invalid status')
], validate, updateTopic);

router.delete('/:id', deleteTopic);

router.put('/:id/toggle', toggleTopicStatus);

export default router;

