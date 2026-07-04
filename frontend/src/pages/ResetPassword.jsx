import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Invalid password reset token link');
      navigate('/login');
    }
  }, [location, navigate]);

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/api/auth/reset-password', {
        token: token,
        newPassword: data.newPassword
      });
      
      if (response.data.success) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
      } else {
        toast.error(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password. The link may have expired.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white dark:bg-dark-900 shadow-xl border border-slate-100 dark:border-dark-800 rounded-3xl p-8 relative z-10">
        <div className="text-center mb-8">
          <span className="text-4xl">🔐</span>
          <h2 className="text-3xl font-extrabold mt-3 bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
            Reset Password
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Enter your new password below.
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                {...register('newPassword', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.newPassword ? 'border-red-500' : ''}`}
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <span className="text-xs text-red-500 mt-1 block">{errors.newPassword.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === newPassword || 'Passwords do not match'
                })}
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 mt-1 block">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-600/20 dark:shadow-primary-600/10 transition duration-150 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">Success!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              Your password has been successfully reset. You can now use your new password to log in.
            </p>
            <Link to="/login" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl transition duration-150 shadow-md">
              Log In Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
