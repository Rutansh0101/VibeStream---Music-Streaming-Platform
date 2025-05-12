import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn, FiLoader } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      toast.success('Login successful!');
      navigate('/');
    } else if (authError) {
      toast.error(authError);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-[#121212] to-[#191414] flex flex-col items-center justify-center px-6">
      <ToastContainer theme="dark" />
      
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.png" // Replace with your logo
            alt="Music Platform Logo" 
            className="w-16 h-16"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Login to Your Account
        </h1>
        
        <div className="bg-[#282828] rounded-lg p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#3E3E3E] w-full pl-10 pr-3 py-3 rounded-md border-none text-white focus:ring-2 focus:ring-[#E91429] focus:outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <a href="#" className="text-sm text-[#E91429] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#3E3E3E] w-full pl-10 pr-3 py-3 rounded-md border-none text-white focus:ring-2 focus:ring-[#E91429] focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-white bg-[#E91429] hover:bg-[#fa1b38] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E91429] font-medium ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                <>
                  <FiLogIn className="mr-2" />
                  Login
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#E91429] hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;