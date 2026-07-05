import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ defaultPath = '/dashboard' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(defaultPath);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 dark:bg-dark-800 dark:hover:bg-dark-700/80 border border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition duration-200 active:scale-95 mb-6 shadow-sm cursor-pointer"
      aria-label="Go back"
    >
      <ArrowLeft size={14} className="transition-transform duration-200 hover:-translate-x-0.5" />
      <span>Back</span>
    </button>
  );
};

export default BackButton;
