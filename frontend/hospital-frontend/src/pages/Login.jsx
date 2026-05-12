import React, { useState, useContext } from 'react';
import { X, Mail, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import HspLogo from '../hsp-logo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      await api.post('/password-reset/request/', { email: resetEmail });
      setResetSent(true);
      toast.success('If the email exists, a reset link has been sent.');
    } catch (err) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl h-[600px] bg-[#007684] rounded-[40px] overflow-hidden shadow-2xl">
        {/* Left Side: Login Form */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-12">
          <div className="bg-white w-full max-w-sm rounded-[30px] p-10 shadow-lg">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-8 tracking-wide">SIGN IN</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input 
                type="email" 
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 pl-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 placeholder-gray-300"
              />

              {/* Password field with visibility toggle */}
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 pl-4 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 placeholder-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-teal-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div className="flex items-center justify-between pt-4">
                <button type="submit" disabled={loading} className="bg-[#007684] text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-[#005f6a] transition-colors shadow-md disabled:opacity-50">
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs font-bold text-gray-800 hover:underline">
                  Forgot Password?
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Branding & Image */}
        <div className="hidden md:block flex-[1.2] bg-cover bg-center relative" style={{ backgroundImage: `url('https://cdn.prod.website-files.com/6466101d017ab9d60c8d0137/65df25f0a339915ec6c00de7_Out%20of%20Hospital%20Costs_Savings%20for%20Medical%20Schemes.jpg')` }}>
          <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-lg">
            <img src={HspLogo} alt="Hospheal Logo" className="h-20 w-20 object-contain" />
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => { setShowForgotModal(false); setResetSent(false); setResetEmail(''); }} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <Mail className="mx-auto text-[#007684] mb-2" size={32} />
              <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
              <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a link to reset your password.</p>
            </div>
            {!resetSent ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <input type="email" placeholder="Email address" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600" />
                <button type="submit" disabled={resetLoading} className="w-full bg-[#007684] text-white py-2.5 rounded-lg font-semibold hover:bg-[#005f6a] transition-colors disabled:opacity-50">
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center text-green-600 p-4">
                <p>A password reset link has been sent to {resetEmail}.</p>
                <button onClick={() => { setShowForgotModal(false); setResetSent(false); setResetEmail(''); }} className="mt-3 text-sm text-[#007684] hover:underline">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;