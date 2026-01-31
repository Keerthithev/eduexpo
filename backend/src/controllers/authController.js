import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Goal from '../models/Goal.js';
import sendOTPEmail from '../services/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user (step 1: send OTP for email verification)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email } = req.body;

    console.log('Register request received:', { name, email });

    // Check if user already exists (registered or in verification)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Check if there's a pending OTP verification
    const existingOTP = await OTP.findOne({ email, type: 'register' });
    if (existingOTP) {
      console.log('Deleting existing OTP for:', email);
      await OTP.deleteOne({ _id: existingOTP._id });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    console.log('Creating OTP record for:', email);

    // Save OTP with temp user data (name and email only - no password yet)
    await OTP.create({
      email,
      otp: hashedOTP,
      type: 'register',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      tempData: {
        name: name
      }
    });

    // Send OTP via email
    console.log('Sending OTP email to:', email);
    const emailSent = await sendOTPEmail(email, otp, 'register');
    
    if (!emailSent) {
      console.log('Failed to send OTP email for:', email);
      await OTP.deleteOne({ email, type: 'register' });
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please try again.' 
      });
    }

    console.log('OTP sent successfully to:', email);

    res.json({
      success: true,
      message: 'OTP sent to your email for verification',
      email: email,
      step: 1 // Indicates email verification step completed, password step next
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify registration OTP (step 2: verify OTP only)
// @route   POST /api/auth/verify-register
// @access  Public
export const verifyRegister = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    // Hash the provided OTP
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      email,
      otp: hashedOTP,
      type: 'register',
      expiresAt: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    // Get temp user data
    const tempData = otpRecord.tempData || {};
    const name = tempData.name;

    if (!name) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'Registration data not found. Please register again.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Mark OTP as verified but don't delete - password step still needs it
    // We update the OTP record to indicate it's verified
    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'OTP verified successfully! Please set your password.',
      email: email,
      name: name,
      step: 2 // Ready for password step
    });
  } catch (error) {
    console.error('Verify register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Set password and create account (step 3: create user after OTP verification)
// @route   POST /api/auth/set-password
// @access  Public
export const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Find verified OTP record
    const otpRecord = await OTP.findOne({
      email,
      type: 'register',
      verified: true
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP verification required first. Please complete verification.' 
      });
    }

    // Get temp user data
    const tempData = otpRecord.tempData || {};
    const name = tempData.name;

    if (!name) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'Registration data not found. Please register again.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isEmailVerified: true
    });

    // Create default goal for user
    await Goal.create({
      user: user._id,
      title: 'My Learning Goal',
      description: 'Start tracking your learning journey'
    });

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now login.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Resend registration OTP
// @route   POST /api/auth/resend-register-otp
// @access  Public
export const resendRegisterOTP = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Delete any existing OTP
    await OTP.deleteMany({ email, type: 'register' });

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    // Save OTP with temp data
    await OTP.create({
      email,
      otp: hashedOTP,
      type: 'register',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      tempData: {
        name: name
      }
    });

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, 'register');
    if (!emailSent) {
      await OTP.deleteOne({ email, type: 'register' });
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP. Please try again.' 
      });
    }

    res.json({
      success: true,
      message: 'New OTP sent to your email',
      email: email
    });
  } catch (error) {
    console.error('Resend register OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: email
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Send OTP for password reset
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If an account exists, an OTP will be sent',
        emailExists: false
      });
    }

    // Delete any existing OTP (no cooldown for development)
    const existingOTP = await OTP.findOne({ email, type: 'forgot-password' });
    
    if (existingOTP) {
      await OTP.deleteOne({ _id: existingOTP._id });
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    await OTP.create({
      email,
      otp: hashedOTP,
      type: 'forgot-password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const emailSent = await sendOTPEmail(email, otp, 'forgot-password');

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP email. Please try again.' 
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your email',
      emailExists: true,
      email: email
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type = 'forgot-password' } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP' });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const otpRecord = await OTP.findOne({
      email,
      otp: hashedOTP,
      type,
      expiresAt: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
      email: email,
      verified: true
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
  try {
    const { email, type = 'forgot-password' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    // Delete any existing OTP
    await OTP.deleteMany({ email, type });

    // Generate new OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    await OTP.create({
      email,
      otp: hashedOTP,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    const emailSent = await sendOTPEmail(email, otp, type);

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to resend OTP. Please try again.' 
      });
    }

    res.json({
      success: true,
      message: 'New OTP sent successfully',
      email: email
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password-otp
// @access  Public
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, OTP and new password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const otpRecord = await OTP.findOne({
      email,
      otp: hashedOTP,
      type: 'forgot-password',
      expiresAt: { $gt: Date.now() }
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: 'Password reset successful! You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Forgot password (legacy)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If an account exists, a password reset link will be sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset link generated',
      resetToken: resetToken,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset password (legacy)
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

