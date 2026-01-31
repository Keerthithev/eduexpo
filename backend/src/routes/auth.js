import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
  register, 
  verifyRegister, 
  resendRegisterOTP,
  setPassword,
  login, 
  forgotPassword, 
  resetPassword, 
  getMe,
  sendOTP,
  verifyOTP,
  resendOTP,
  resetPasswordWithOTP
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({ 
      success: false, 
      message: firstError.msg || 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

// Registration with OTP verification (3 steps: email -> OTP -> password)
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email')
], validate, register);

router.post('/verify-register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], validate, verifyRegister);

router.post('/set-password', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, setPassword);

router.post('/resend-register-otp', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email')
], validate, resendRegisterOTP);

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], validate, login);

// OTP routes for password reset
router.post('/send-otp', [
  body('email').isEmail().withMessage('Please provide a valid email')
], validate, sendOTP);

router.post('/verify-otp', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], validate, verifyOTP);

router.post('/resend-otp', [
  body('email').isEmail().withMessage('Please provide a valid email')
], validate, resendOTP);

router.post('/reset-password-otp', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, resetPasswordWithOTP);

// Legacy forgot password route
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], validate, forgotPassword);

router.post('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, resetPassword);

router.get('/me', protect, getMe);

export default router;

