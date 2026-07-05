import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    const success = await login(data.usernameOrEmail, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    // Standard redirection to Spring Boot Google OAuth2 authorization endpoint
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const redirectUri = window.location.origin + '/oauth2/redirect';
    window.location.href = `${backendUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white dark:bg-dark-900 shadow-xl border border-slate-100 dark:border-dark-800 rounded-3xl p-8 relative z-10">
        <div className="text-center mb-8">
          <img 
            src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
            alt="CarbonMitra Logo" 
            className="h-12 w-auto mx-auto object-contain" 
          />
          <h2 className="text-3xl font-extrabold mt-3 bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
            Welcome to CarbonMitra
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Monitor and reduce your carbon footprint
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              {...register('usernameOrEmail', { required: 'Username or Email is required' })}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.usernameOrEmail ? 'border-red-500' : ''}`}
              placeholder="Enter your username or email"
            />
            {errors.usernameOrEmail && (
              <span className="text-xs text-red-500 mt-1 block">{errors.usernameOrEmail.message}</span>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Password
              </label>
              <Link to="/forgot-password" id="forgot-password-link" className="text-xs text-primary-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-600/20 dark:shadow-primary-600/10 transition duration-150 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-dark-700"></div>
          </div>
          <span className="bg-white dark:bg-dark-900 px-3 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider relative z-10">
            or continue with
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200 font-semibold py-3 rounded-xl transition duration-150 flex items-center justify-center space-x-3"
        >
          {/* Google Icon SVG */}
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.1C18.281 1.96 15.489 1 12.24 1 5.922 1 1 5.92 1 12s4.922 11 11.24 11c6.6 0 11-4.6 11-11.185 0-.756-.08-1.336-.18-1.915H12.24z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-semibold">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
