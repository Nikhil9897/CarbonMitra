import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
  const { handleOAuth2LoginSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshToken = params.get('refresh_token');

    if (token && refreshToken) {
      hasRun.current = true;
      const processLogin = async () => {
        await handleOAuth2LoginSuccess(token, refreshToken);
        navigate('/dashboard', { replace: true });
      };
      processLogin();
    } else {
      navigate('/login', { replace: true });
    }
  }, [location, handleOAuth2LoginSuccess, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">Completing Google Login...</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
