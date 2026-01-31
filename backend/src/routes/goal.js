import express from 'express';
import { body, validationResult } from 'express-validator';
import { getGoal, createOrUpdateGoal, updateGoal, deleteGoal } from '../controllers/goalController.js';
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

// Goal routes
router.get('/', getGoal);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().isString()
], validate, createOrUpdateGoal);

router.put('/', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isString()
], validate, updateGoal);

router.delete('/', deleteGoal);

export default router;

