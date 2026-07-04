import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      role: 'ROLE_USER'
    }
  });

  const selectedRole = useWatch({
    control,
    name: 'role',
  });

  const onSubmit = async (data) => {
    const success = await signup(
      data.username,
      data.email,
      data.password,
      data.role,
      data.role === 'ROLE_ORGANIZATION_ADMIN' ? data.organizationName : null,
      data.role === 'ROLE_USER' && data.organizationId ? parseInt(data.organizationId) : null
    );
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const redirectUri = window.location.origin + '/oauth2/redirect';
    window.location.href = `${backendUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 relative overflow-hidden transition-colors duration-200">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white dark:bg-dark-900 shadow-xl border border-slate-100 dark:border-dark-800 rounded-3xl p-8 relative z-10">
        <div className="text-center mb-6">
          <span className="text-4xl">🌱</span>
          <h2 className="text-3xl font-extrabold mt-3 bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">
            Get Started
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create your account to start tracking emissions
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Username
            </label>
            <input
              type="text"
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.username ? 'border-red-500' : ''}`}
              placeholder="Pick a unique username"
            />
            {errors.username && (
              <span className="text-xs text-red-500 mt-0.5 block">{errors.username.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
              })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.email ? 'border-red-500' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-0.5 block">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="At least 6 characters"
            />
            {errors.password && (
              <span className="text-xs text-red-500 mt-0.5 block">{errors.password.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              I want to register as
            </label>
            <select
              {...register('role')}
              className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100"
            >
              <option value="ROLE_USER">Individual User</option>
              <option value="ROLE_ORGANIZATION_ADMIN">Organization Manager</option>
            </select>
          </div>

          {/* Conditional Fields based on Role Selection */}
          {selectedRole === 'ROLE_ORGANIZATION_ADMIN' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                {...register('organizationName', { required: 'Organization name is required to register as admin' })}
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.organizationName ? 'border-red-500' : ''}`}
                placeholder="Create a new organization"
              />
              {errors.organizationName && (
                <span className="text-xs text-red-500 mt-0.5 block">{errors.organizationName.message}</span>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Organization ID (Optional)
              </label>
              <input
                type="text"
                {...register('organizationId')}
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100"
                placeholder="Leave blank to register independently"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-600/20 dark:shadow-primary-600/10 transition duration-150 flex items-center justify-center space-x-2 mt-4"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-dark-700"></div>
          </div>
          <span className="bg-white dark:bg-dark-900 px-3 text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider relative z-10">
            or register with
          </span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full border border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-200 font-semibold py-2.5 rounded-xl transition duration-150 flex items-center justify-center space-x-3"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.1C18.281 1.96 15.489 1 12.24 1 5.922 1 1 5.92 1 12s4.922 11 11.24 11c6.6 0 11-4.6 11-11.185 0-.756-.08-1.336-.18-1.915H12.24z"
            />
          </svg>
          <span>Sign Up with Google</span>
        </button>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-semibold">
            Log In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
