import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['forgot-password', 'register'],
    default: 'forgot-password'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: { expires: 0 } // Auto-delete after expiry
  },
  tempData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create compound index for email and type
otpSchema.index({ email: 1, type: 1 });

export default mongoose.model('OTP', otpSchema);

