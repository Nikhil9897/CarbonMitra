import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';

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
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const redirectUri = window.location.origin + '/oauth2/redirect';
    window.location.href = `${backendUrl}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-bgEco text-textEco overflow-hidden">
      {/* LEFT COLUMN: Eco Video (visible on desktop only) */}
      <div className="hidden lg:block lg:col-span-6 relative overflow-hidden bg-emerald-950">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          <source src="/windmill.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-transparent"></div>
        <div className="absolute bottom-16 left-16 right-16 text-white z-10 space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
              alt="CarbonMitra Logo" 
              className="h-10 w-auto object-contain" 
            />
            <span className="font-mono text-lg font-bold tracking-[0.25em] uppercase text-white">
              Carbon<span className="text-[#81C784]">Mitra</span>
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight uppercase font-sans">
            Empowering global enterprises to monitor emissions and achieve Net Zero.
          </h1>
          <p className="text-emerald-100 text-sm leading-relaxed max-w-md font-sans font-medium">
            Join thousands of corporate teams tracking dynamic logistical footprints, compiling CSRD carbon disclosures, and auditing offsets.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Login Form */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-6 md:p-12 bg-[#F8FCF8] relative">
        {/* Soft background glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md bg-white border border-borderEco rounded-3xl p-8 shadow-xl hover:shadow-2xl transition duration-300 relative z-10">
          <BackButton defaultPath="/" />
          
          <div className="text-center mb-8">
            <img 
              src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
              alt="CarbonMitra Logo" 
              className="h-12 w-auto mx-auto object-contain lg:hidden mb-4" 
            />
            <h2 className="text-3xl font-extrabold mt-3 bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent tracking-tight uppercase">
              Enterprise Login
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Access your sustainability credentials
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Username or Email
              </label>
              <input
                type="text"
                {...register('usernameOrEmail', { required: 'Username or Email is required' })}
                className="w-full px-4 py-3 rounded-xl border bg-[#F8FCF8] border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-[#1C2B22]"
                placeholder="Enter your username or email"
              />
              {errors.usernameOrEmail && (
                <span className="text-xs text-red-500 mt-1 block">{errors.usernameOrEmail.message}</span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <Link to="/forgot-password" id="forgot-password-link" className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-bold">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-3 rounded-xl border bg-[#F8FCF8] border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-[#1C2B22]"
                placeholder="Enter your password"
              />
              {errors.password && (
                <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold py-3 rounded-xl shadow-md hover:scale-[1.02] active:scale-98 transition duration-200 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="bg-white px-3 text-[10px] text-slate-400 uppercase tracking-widest relative z-10 font-bold">
              or continue with
            </span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition duration-150 flex items-center justify-center space-x-3"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path
                  fill="#4285F4"
                  d="M22.56,12.25c0,-0.78 -0.07,-1.53 -0.2,-2.25l,-10.36,0l0,4.26l5.92,0c-0.26,1.37 -1.04,2.53 -2.21,3.31l0,2.77l3.57,0c2.08,-1.92 3.28,-4.74 3.28,-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12,23c2.97,0 5.46,-0.98 7.28,-2.66l-3.57,-2.77c-0.98,0.66 -2.23,1.06 -3.71,1.06c-2.86,0 -5.29,-1.93 -6.16,-4.53l-3.69,0l0,2.86c1.81,3.59 5.54,6.04 9.85,6.04z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84,14.1c-0.22,-0.66 -0.35,-1.36 -0.35,-2.1c0,-0.74 0.13,-1.44 0.35,-2.1l0,-2.86l-3.69,0c-0.79,1.57 -1.24,3.33 -1.24,5.19c0,1.86 0.45,3.62 1.24,5.19l3.69,-2.86z"
                />
                <path
                  fill="#EA4335"
                  d="M12,5.38c1.62,0 3.06,0.56 4.21,1.64l3.15,-3.15c-1.91,-1.78 -4.41,-2.87 -7.36,-2.87c-4.31,0 -8.04,2.45 -9.85,6.04l3.69,2.86c0.87,-2.6 3.3,-4.53 6.16,-4.53z"
                />
              </g>
            </svg>
            <span>Sign In with Google</span>
          </button>

          <p className="text-center text-sm text-slate-500 mt-8 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 hover:underline font-bold">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
