import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/send-otp', {
        email: formData.email
      });

      if (response.data.success) {
        setSuccess('OTP sent to your email!');
        setStep(2);
        setResendTimer(60);
        setCanResend(false);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send OTP';
      if (err.response?.data?.cooldown) {
        setResendTimer(err.response.data.remainingTime);
        setCanResend(false);
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: otp,
        type: 'forgot-password'
      });

      if (response.data.success) {
        setSuccess('OTP verified! Please enter your new password.');
        setStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password-otp', {
        email: formData.email,
        otp: otp,
        password: formData.password
      });

      if (response.data.success) {
        setSuccess('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/resend-otp', {
        email: formData.email,
        type: 'forgot-password'
      });

      if (response.data.success) {
        setSuccess('New OTP sent!');
        setResendTimer(60);
        setCanResend(false);
        setOtp('');
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  // Back buttons
  const handleBackToEmail = () => {
    setStep(1);
    setOtp('');
    setError('');
    setSuccess('');
  };

  const handleBackToOTP = () => {
    setStep(2);
    setFormData({ ...formData, password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/85 to-purple-700/85"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white w-full">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <svg className="h-14 w-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">Reset Password</h1>
            <p className="text-xl text-blue-100 max-w-md mx-auto">
              Don't worry! It happens to the best of us. Let's get you back on track.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-12 max-w-lg">
            {[
              { icon: '🔐', text: 'Secure Recovery' },
              { icon: '✨', text: 'Easy Process' },
              { icon: '⚡', text: 'Quick Reset' },
              { icon: '🛡️', text: 'Protected' }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <p className="text-sm text-blue-100 font-medium">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Student Learning Tracker</h1>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Progress Indicator */}
            <div className="bg-gray-50 px-8 pt-6 pb-4">
              <div className="flex items-center justify-center">
                {[
                  { step: 1, label: 'Email' },
                  { step: 2, label: 'Verify' },
                  { step: 3, label: 'Password' }
                ].map((item) => (
                  <div key={item.step} className="flex items-center">
                    <div className={`flex items-center ${step >= item.step ? 'text-blue-600' : 'text-gray-300'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        step >= item.step 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step > item.step ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          item.step
                        )}
                      </div>
                      <span className="ml-2 text-sm font-medium hidden sm:inline">{item.label}</span>
                    </div>
                    {item.step < 3 && (
                      <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 ${
                        step > item.step ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {step === 1 && 'Forgot Password'}
                  {step === 2 && 'Verify OTP'}
                  {step === 3 && 'Set New Password'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {step === 1 && 'Enter your email to receive a verification code'}
                  {step === 2 && 'Enter the OTP sent to your email'}
                  {step === 3 && 'Enter your new password'}
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {success}
                </div>
              )}

              {/* Step 1: Email Form */}
              {step === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      OTP sent to <span className="font-semibold text-gray-900">{formData.email}</span>
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      className="input text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full btn btn-primary py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <div className="text-center">
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Resend in <span className="font-semibold text-blue-600">{resendTimer}s</span>
                      </p>
                    )}
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      ← Change Email
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className="input pr-10"
                        placeholder="At least 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="input pr-10"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleBackToOTP}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      ← Back to OTP
                    </button>
                  </div>
                </form>
              )}

              {/* Back to Login Link */}
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            © 2026 Student Learning Tracker. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

