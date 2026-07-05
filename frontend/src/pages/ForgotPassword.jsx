import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';

const ForgotPassword = () => {
  const [isSent, setIsSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email: data.email });
      if (response.data.success) {
        setIsSent(true);
        toast.success(response.data.message || 'Reset link sent successfully!');
      } else {
        toast.error(response.data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to request password reset';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgEco p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white shadow-xl border border-borderEco rounded-3xl p-8 relative z-10">
        <BackButton defaultPath="/login" />
        <div className="text-center mb-8">
          <span className="text-4xl">🔑</span>
          <h2 className="text-3xl font-extrabold mt-3 bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent uppercase tracking-tight">
            Forgot Password
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            No worries! We'll send you instructions to reset your password.
          </p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={`w-full px-4 py-3 rounded-xl border bg-bgEco border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-textEco ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your registered email"
              />
              {errors.email && (
                <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-98 transition duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800 mb-2">Check your email!</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              We've sent a password reset link to your email address. Please follow the instructions to set a new password.
            </p>
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-sm font-bold text-primary-600 hover:text-primary-700">
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
