import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import loginImage from '../assets/wizard/pages/login.jpg';
import registerImage from '../assets/wizard/pages/register.jpg';

export default function AuthPage() {
  const { login } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Backend Health Check States
  const [isServerLive, setIsServerLive] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    owner_name: '',
    company_name: '',
    address: '',
    phone_number: ''
  });

  // Check Backend Health on Mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      setIsChecking(true);
      try {
        const response = await api.get('/health');
        setIsServerLive(response.status === 200);
      } catch (error) {
        console.error('Backend health check failed:', error);
        setIsServerLive(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBackendHealth();
  }, []);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/login', loginData);
      toast.success('Login Successful!');
      login(response.data.access_token);
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || 'Invalid Username or Password';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!registerData.owner_name || !registerData.phone_number) {
      toast.error('Please enter your name and phone number');
      return;
    }
    
    if (!registerData.company_name || !registerData.address) {
      toast.error('Please enter company details');
      return;
    }
    
    if (!registerData.username || !registerData.password) {
      toast.error('Please set username and password');
      return;
    }
    
    if (registerData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await api.post('/auth/register', registerData);
      toast.success('Registration Successful! Please login.');
      setIsRegister(false);
      setLoginData({ username: registerData.username, password: '' });
      setRegisterData({
        username: '',
        password: '',
        owner_name: '',
        company_name: '',
        address: '',
        phone_number: ''
      });
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-gray-300 rounded-full animate-float"
            style={{
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 15 + 's',
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl relative z-10">
        
        {/* Card Container with proper height constraints */}
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100" style={{ height: '85vh', maxHeight: '700px' }}>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-transparent to-gray-100 blur-2xl"></div>
          </div>

          {/* Two-Panel Layout with Swapping Animation */}
          <div className="relative h-full flex">
            
            {/* FORM PANEL - Slides between left and right */}
            <div 
              className="absolute inset-y-0 w-full md:w-1/2 bg-white transition-all duration-700 ease-in-out z-10"
              style={{ 
                transform: isRegister ? 'translateX(100%)' : 'translateX(0)',
                left: 0
              }}
            >
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-8 md:p-12">
                  
                  {/* Login Form */}
                  <div className={`${isRegister ? 'hidden' : 'block'}`}>
                    {/* Login Header */}
                    <div className="mb-8">
                      <div className="w-14 h-14 mb-6 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Welcome Back
                      </h1>
                      <p className="text-gray-500 text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Sign in to GenaJewel
                      </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      
                      {/* Username */}
                      <div className="group">
                        <label className="block text-gray-700 text-sm font-medium mb-2.5 transition-colors group-focus-within:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Username
                        </label>
                        <input
                          type="text"
                          value={loginData.username}
                          onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                          className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                          placeholder="Enter your username"
                          required
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        />
                      </div>

                      {/* Password */}
                      <div className="group">
                        <label className="block text-gray-700 text-sm font-medium mb-2.5 transition-colors group-focus-within:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                            placeholder="Enter your password"
                            required
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remember Me & Forgot Password */}
                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500 focus:ring-2 cursor-pointer transition-all"
                          />
                          <span className="ml-2.5 text-sm text-gray-600 group-hover:text-gray-900 transition-colors" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Remember me
                          </span>
                        </label>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Forgot password?
                        </a>
                      </div>

                      {/* Sign In Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing in...
                          </div>
                        ) : (
                          'Sign In'
                        )}
                      </button>

                      {/* Divider */}
                      <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                            New to GenaJewels?
                          </span>
                        </div>
                      </div>

                      {/* Create Account Button */}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="w-full bg-white text-gray-900 py-4 rounded-xl font-medium border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Create Account
                      </button>
                    </form>
                  </div>

                  {/* Register Form */}
                  <div className={`${isRegister ? 'block' : 'hidden'}`}>
                    {/* Register Header */}
                    <div className="mb-6">
                      <div className="w-14 h-14 mb-6 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-3 tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        Join Us
                      </h1>
                      <p className="text-gray-500 text-base" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Create your GenaJewels account
                      </p>
                    </div>

                    {/* Register Form */}
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      
                      {/* Personal Information Section */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Personal Information
                        </h3>
                        
                        {/* Owner Name */}
                        <div className="group">
                          <label className="block text-gray-700 text-sm font-medium mb-2 transition-colors group-focus-within:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={registerData.owner_name}
                            onChange={(e) => setRegisterData({ ...registerData, owner_name: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                            placeholder="Enter your full name"
                            required
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>

                        {/* Phone Number */}
                        <div className="group">
                          <label className="block text-gray-700 text-sm font-medium mb-2 transition-colors group-focus-within:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={registerData.phone_number}
                            onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                            placeholder="Enter your phone number"
                            required
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                      </div>

                      {/* Company Information Section */}
                      <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Company Information
                        </h3>
                        
                        {/* Company Name */}
                        <div className="group">
                          <label className="block text-gray-700 text-sm font-medium mb-2 transition-colors group-focus-within:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={registerData.company_name}
                            onChange={(e) => setRegisterData({ ...registerData, company_name: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                            placeholder="Enter company name"
                            required
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>

                        {/* Address */}
                        <div className="group">
                          <label className="block text-gray-700 text-sm font-medium mb-2 transition-colors group-focus-within:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Address
                          </label>
                          <textarea
                            value={registerData.address}
                            onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200 resize-none"
                            placeholder="Enter company address"
                            rows="2"
                            required
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>
                      </div>

                      {/* Account Credentials Section */}
                      <div className="space-y-4 pt-2">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
                          Account Credentials
                        </h3>
                        
                        {/* Username */}
                        <div className="group">
                          <label className="block text-gray-700 text-sm font-medium mb-2 transition-colors group-focus-within:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Username
                          </label>
                          <input
                            type="text"
                            value={registerData.username}
                            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                            placeholder="Choose a username"
                            required
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          />
                        </div>

                        {/* Password */}
                        <div className="group">
                          <label className="block text-gray-700 text-sm font-medium mb-2 transition-colors group-focus-within:text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all duration-200"
                              placeholder="Create a password (min. 8 characters)"
                              required
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              )}
                            </button>
                          </div>
                          <p className="mt-1.5 text-xs text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Password must be at least 8 characters long
                          </p>
                        </div>
                      </div>

                      {/* Create Account Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 rounded-xl font-medium hover:from-gray-800 hover:to-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating Account...
                          </div>
                        ) : (
                          'Create Account'
                        )}
                      </button>

                      {/* Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Already have an account?
                          </span>
                        </div>
                      </div>

                      {/* Back to Login Button */}
                      <button
                        type="button"
                        onClick={toggleMode}
                        className="w-full bg-white text-gray-900 py-4 rounded-xl font-medium border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        Sign In
                      </button>
                    </form>
                  </div>

                </div>
              </div>
            </div>

            {/* IMAGE PANEL - Slides between right and left */}
            <div 
              className="hidden md:block absolute inset-y-0 w-1/2 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 transition-all duration-700 ease-in-out"
              style={{ 
                transform: isRegister ? 'translateX(-100%)' : 'translateX(0)',
                right: 0
              }}
            >
              
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img 
                  src={isRegister ? registerImage : loginImage}
                  alt="Jewelry" 
                  className="w-full h-full object-cover transition-opacity duration-700"
                  style={{ opacity: 0.95 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-900/50 to-transparent"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-end p-12 lg:p-16 z-10">
                
                {/* Animated Content */}
                <div 
                  key={isRegister ? 'register' : 'login'}
                  className="space-y-6 animate-fade-slide-up"
                >
                  {/* Decorative Line */}
                  <div className="w-16 h-1 bg-white/40 rounded-full animate-expand"></div>
                  
                  {/* Title */}
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {isRegister ? 'Begin Your Journey' : 'Crafting Excellence'}
                  </h2>
                  
                  {/* Description */}
                  <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {isRegister 
                      ? 'Join our community and manage your precious collections with precision and elegance.'
                      : 'Where artistry meets precision in the world of fine jewelry management.'}
                  </p>

                  {/* Feature Points */}
                  <div className="space-y-3 pt-4">
                    {(isRegister 
                      ? ['Advanced inventory management', 'Secure data protection', 'Real-time analytics']
                      : ['Comprehensive catalog system', 'Professional tools', 'Trusted by experts']
                    ).map((feature, index) => (
                      <div 
                        key={feature}
                        className="flex items-center space-x-3 animate-fade-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <svg className="w-5 h-5 text-white/80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-white/80 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subtle Overlay Animation - Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
              
              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-20 h-20 border border-white/20 rounded-full animate-spin-slow"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 border border-white/20 rounded-full animate-spin-reverse"></div>
            </div>

          </div>

          {/* Decorative Corner Dots */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-gray-300 rounded-full animate-pulse-dot"></div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-gray-300 rounded-full animate-pulse-dot" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-4 left-4 w-2 h-2 bg-gray-300 rounded-full animate-pulse-dot" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-4 right-4 w-2 h-2 bg-gray-300 rounded-full animate-pulse-dot" style={{animationDelay: '3s'}}></div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
          By continuing, you agree to our{' '}
          <a href="#" className="text-gray-900 hover:underline transition-all font-medium">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-gray-900 hover:underline transition-all font-medium">Privacy Policy</a>
        </p>
      </div>

      {/* --- OFFLINE MODAL OVERLAY --- */}
      {!isServerLive && !isChecking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/30 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-12 max-w-lg text-center transform scale-100 animate-scale-up">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
              🔌
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              AI Engine Offline
            </h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              The backend AI engine is currently resting. We cannot process requests right now. Please check back in a little while!
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Complete Animation Styles */}
      <style jsx>{`
        /* Import Professional Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        
        /* Shimmer Effect */
        @keyframes shimmer {
          0% { 
            transform: translateX(-100%); 
          }
          100% { 
            transform: translateX(100%); 
          }
        }
        
        /* Floating Particles */
        @keyframes float {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.2; 
          }
          50% { 
            transform: translate(50px, -50px) scale(1.5); 
            opacity: 0.4; 
          }
        }
        
        /* Pulse Dot Animation */
        @keyframes pulse-dot {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.5); 
          }
        }
        
        /* Fade Slide Up */
        @keyframes fade-slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Fade In */
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* Scale Up */
        @keyframes scale-up {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        /* Expand Line */
        @keyframes expand {
          from {
            width: 0;
          }
          to {
            width: 4rem;
          }
        }
        
        /* Spin Slow */
        @keyframes spin-slow {
          from { 
            transform: rotate(0deg); 
          }
          to { 
            transform: rotate(360deg); 
          }
        }
        
        /* Spin Reverse */
        @keyframes spin-reverse {
          from { 
            transform: rotate(360deg); 
          }
          to { 
            transform: rotate(0deg); 
          }
        }
        
        /* Apply Animations */
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 4s ease-in-out infinite;
        }
        
        .animate-pulse-dot {
          animation: pulse-dot 3s ease-in-out infinite;
        }
        
        .animate-fade-slide-up {
          animation: fade-slide-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-scale-up {
          animation: scale-up 0.4s ease-out forwards;
        }
        
        .animate-expand {
          animation: expand 0.8s ease-out forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        
        /* Smooth transitions for all elements */
        * {
          transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        /* Input focus effects */
        input:focus,
        textarea:focus {
          transform: translateY(-2px);
        }
        
        /* Button hover effects */
        button:not(:disabled):hover {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        
        /* Smooth image transitions */
        img {
          transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* Custom scrollbar for form areas */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
      `}</style>
    </div>
  );
}