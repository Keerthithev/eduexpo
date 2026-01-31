import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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

  const handleSwitchToRegister = () => {
    setIsLogin(false);
    setError('');
    setSuccess('');
    setRegisterStep(1);
    setOtp('');
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setError('');
    setSuccess('');
    setRegisterStep(1);
    setOtp('');
  };

  // Login handlers
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Register handlers
  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!registerData.name || !registerData.email) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        name: registerData.name,
        email: registerData.email
      });

      if (response.data.success) {
        setSuccess('OTP sent to your email!');
        setRegisterStep(2);
        setResendTimer(60);
        setCanResend(false);
      } else {
        setError(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/verify-register', {
        email: registerData.email,
        otp: otp
      });

      if (response.data.success) {
        setSuccess('OTP verified! Now set your password.');
        setRegisterStep(3);
      } else {
        setError(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/set-password', {
        email: registerData.email,
        password: registerData.password
      });

      if (response.data.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          handleSwitchToLogin();
          setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to create account');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/auth/resend-register-otp', {
        name: registerData.name,
        email: registerData.email
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">Student Learning Tracker</h1>
            <p className="text-xl text-blue-100 max-w-md mx-auto">
              "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mt-12 max-w-lg">
            {[
              { icon: '📚', text: 'Track Courses' },
              { icon: '🎯', text: 'Set Goals' },
              { icon: '📈', text: 'Monitor Progress' },
              { icon: '🏆', text: 'Achieve Success' }
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Student Learning Tracker</h1>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Progress Indicator for Register */}
            {!isLogin && (
              <div className="bg-gray-50 px-8 pt-6 pb-4">
                <div className="flex items-center justify-center">
                  {[
                    { step: 1, label: 'Email' },
                    { step: 2, label: 'Verify' },
                    { step: 3, label: 'Password' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-center">
                      <div className={`flex items-center ${registerStep >= item.step ? 'text-blue-600' : 'text-gray-300'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                          registerStep >= item.step 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {registerStep > item.step ? (
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
                          registerStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Content */}
            <div className="p-8">
              {/* Login Form */}
              {isLogin && (
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-gray-600">Sign in to continue your learning journey</p>
                  </div>

                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                      <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="input"
                        placeholder="Enter your email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          className="input pr-10"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      className="w-full btn btn-primary py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Don't have an account?{' '}
                      <button
                        onClick={handleSwitchToRegister}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Register
                      </button>
                    </p>
                  </div>
                </div>
              )}

              {/* Register Form */}
              {!isLogin && (
                <div>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    <p className="text-gray-600 mt-1">
                      {registerStep === 1 && 'Enter your details to get started'}
                      {registerStep === 2 && 'Enter the OTP sent to your email'}
                      {registerStep === 3 && 'Set your password to complete registration'}
                    </p>
                  </div>

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

                  {/* Step 1: Name & Email */}
                  {registerStep === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          className="input"
                          placeholder="Enter your full name"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="input"
                          placeholder="Enter your email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
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

                  {/* Step 2: OTP */}
                  {registerStep === 2 && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                          OTP sent to <span className="font-semibold text-gray-900">{registerData.email}</span>
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
                          onClick={() => setRegisterStep(1)}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          ← Change Email
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Password */}
                  {registerStep === 3 && (
                    <form onSubmit={handleSetPassword} className="space-y-4">
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">
                          Email verified! Set your password
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className="input pr-10"
                            placeholder="At least 6 characters"
                            value={registerData.password}
                            onChange={handleRegisterChange}
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
                            value={registerData.confirmPassword}
                            onChange={handleRegisterChange}
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
                        {loading ? 'Creating...' : 'Create Account'}
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(2)}
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          ← Back to OTP
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Switch to Login */}
                  {!isLogin && (
                    <div className="mt-6 text-center">
                      <p className="text-gray-600">
                        Already have an account?{' '}
                        <button
                          onClick={handleSwitchToLogin}
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                          Login
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}
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

export default Auth;

