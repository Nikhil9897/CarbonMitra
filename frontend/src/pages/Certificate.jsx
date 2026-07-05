import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Award, Printer, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

const Certificate = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    carbonTracked: 0,
    carbonSaved: 0,
    goalsCompletedCount: 0,
    earnedBadgesCount: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [activitiesRes, goalsRes, badgesRes] = await Promise.all([
        api.get('/api/activities'),
        api.get('/api/goals'),
        api.get('/api/badges')
      ]);

      let carbonTracked = 0;
      let goalsCompletedCount = 0;
      let earnedBadgesCount = 0;

      if (activitiesRes.data.success) {
        carbonTracked = activitiesRes.data.data.reduce((acc, item) => acc + (item.co2e || 0), 0);
      }

      if (goalsRes.data.success) {
        goalsCompletedCount = goalsRes.data.data.filter(g => g.status === 'COMPLETED').length;
      }

      if (badgesRes.data.success) {
        earnedBadgesCount = badgesRes.data.data.filter(b => b.awarded).length;
      }

      // Dynamic Carbon Saved Calculation:
      // - 100 kg offset per completed goal
      // - 50 kg offset per earned badge
      // - Base 20 kg offset for joining and actively logging
      const carbonSaved = (goalsCompletedCount * 100) + (earnedBadgesCount * 50) + (carbonTracked > 0 ? 20 : 0);

      setStats({
        carbonTracked: parseFloat(carbonTracked.toFixed(2)),
        carbonSaved: parseFloat(carbonSaved.toFixed(2)),
        goalsCompletedCount,
        earnedBadgesCount
      });
    } catch (err) {
      toast.error('Failed to load carbon metrics for certificate');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Generate a unique Verification Hash based on user id and username
  const verificationHash = user 
    ? `CM-${user.id}-${Math.abs(user.username.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase()}`
    : 'CM-0000-0000';

  // Determine Badge Rank / Level
  let rankName = 'Eco-Novice';
  if (stats.earnedBadgesCount >= 6) {
    rankName = 'Forest Guardian';
  } else if (stats.earnedBadgesCount >= 3) {
    rankName = 'Planet Advocate';
  }

  return (
    <div className="space-y-6">
      {/* Control panel (no-print) */}
      <div className="no-print bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors duration-200">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center space-x-2">
            <Award className="text-primary-500" />
            <span>Sustainability Certificate</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate and download your official environmental contribution pass.
          </p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex-1 sm:flex-initial border border-slate-200 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-800 p-3 rounded-xl transition flex items-center justify-center space-x-2 text-sm font-semibold"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Sync Stats</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex-1 sm:flex-initial bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary-600/20 transition flex items-center justify-center space-x-2 text-sm"
          >
            <Printer size={16} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        /* Certificate View Container */
        <div className="flex justify-center p-2 sm:p-4 overflow-x-auto">
          {/* Print specific CSS inline */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .print-certificate-container, .print-certificate-container * {
                visibility: visible;
              }
              .print-certificate-container {
                position: fixed;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%) scale(1.0);
                width: 297mm;
                height: 210mm;
                margin: 0;
                padding: 30px;
                border: 15px double #10b981 !important;
                background-color: #ffffff !important;
                box-shadow: none !important;
                page-break-inside: avoid;
                color: #0f172a !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @page {
                size: landscape;
                margin: 0;
              }
            }
          `}} />

          {/* Actual Certificate Paper */}
          <div className="print-certificate-container w-full max-w-[850px] aspect-[1.414/1] bg-white dark:bg-dark-900 border-[12px] border-double border-emerald-600/60 p-8 sm:p-12 flex flex-col justify-between relative shadow-2xl transition-colors duration-200">
            {/* Elegant watermark background shapes */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border-[40px] border-emerald-500/5 rounded-full pointer-events-none flex items-center justify-center">
              <span className="text-7xl opacity-5">🌱</span>
            </div>

            {/* Corner Ornamental Accents */}
            <div className="absolute top-2 left-2 border-t-2 border-l-2 border-emerald-600/40 w-8 h-8"></div>
            <div className="absolute top-2 right-2 border-t-2 border-r-2 border-emerald-600/40 w-8 h-8"></div>
            <div className="absolute bottom-2 left-2 border-b-2 border-l-2 border-emerald-600/40 w-8 h-8"></div>
            <div className="absolute bottom-2 right-2 border-b-2 border-r-2 border-emerald-600/40 w-8 h-8"></div>

            {/* Top Branding Section */}
            <div className="text-center space-y-1">
              <div className="flex justify-center items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
                <img 
                  src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
                  alt="CarbonMitra Logo" 
                  className="h-6 w-auto object-contain" 
                />
                <span className="font-extrabold text-sm uppercase tracking-widest">CarbonMitra Global</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                Certificate of Environmental Contribution
              </h2>
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-emerald-600 to-transparent mx-auto mt-2"></div>
            </div>

            {/* Awardee Presentation Section */}
            <div className="text-center space-y-4 my-6">
              <p className="text-xs sm:text-sm font-serif italic text-slate-400 dark:text-slate-500">
                This official award of sustainability is proudly presented to
              </p>
              
              <div>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-serif tracking-wide underline decoration-dotted decoration-emerald-500/40 decoration-2 underline-offset-8">
                  {user?.username}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto leading-relaxed">
                for outstanding commitment to environmental advocacy. Through active monitoring and carbon footprint logging on CarbonMitra, this citizen has logged and managed their emissions, contributing directly to a cleaner, pollution-free future.
              </p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-4 border-y border-slate-100 dark:border-dark-800/60 py-4 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Carbon Logged</p>
                <p className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {stats.carbonTracked} <span className="text-xs font-semibold">kg CO₂e</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Estimated Offset</p>
                <p className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {stats.carbonSaved} <span className="text-xs font-semibold">kg CO₂e</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sustainability Level</p>
                <p className="text-sm sm:text-base font-extrabold text-primary-600 dark:text-primary-400 mt-1 flex items-center justify-center">
                  <Sparkles size={12} className="mr-1" />
                  {rankName}
                </p>
              </div>
            </div>

            {/* Bottom Verification Section & Signatures */}
            <div className="flex justify-between items-end mt-4">
              {/* Verification Code */}
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span className="text-[9px] uppercase font-bold tracking-wider">Verification Pass</span>
                </div>
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-dark-800 border border-slate-100 dark:border-dark-700/50 px-2 py-0.5 rounded-lg select-all">
                  {verificationHash}
                </p>
              </div>

              {/* Gold/Green Seal */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-emerald-600/30 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/20">
                <div className="text-center flex flex-col items-center">
                  <span className="text-lg sm:text-xl">🌿</span>
                  <span className="text-[7px] font-black uppercase text-emerald-700 dark:text-emerald-300 tracking-tighter">Carbon Seal</span>
                </div>
                <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-pulse"></div>
              </div>

              {/* Authorized signature */}
              <div className="text-center w-36">
                <div className="font-serif italic text-emerald-600 dark:text-emerald-400 text-sm select-none">
                  Committee Board
                </div>
                <div className="w-full h-px bg-slate-200 dark:border-dark-700/80 my-1"></div>
                <p className="text-[8px] uppercase tracking-widest text-slate-400">CarbonMitra Global</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;
