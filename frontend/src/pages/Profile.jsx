import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { User, Award, Key, Sparkles, Camera, ShieldAlert, Award as AwardIcon, Video, X } from 'lucide-react';

const Profile = () => {
  const { user, updateUserState } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profilePic, setProfilePic] = useState('');

  // Camera states
  const [cameraActive, setCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || ''
    }
  });

  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePic(user.profilePicture);
    }
  }, [user]);

  // Handle active camera streaming
  useEffect(() => {
    let activeStream = null;
    if (cameraActive) {
      navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400, facingMode: 'user' } })
        .then(stream => {
          activeStream = stream;
          setVideoStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          toast.error('Unable to access camera: ' + err.message);
          setCameraActive(false);
        });
    }
    
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraActive]);

  const fetchBadges = async () => {
    try {
      const response = await api.get('/api/badges');
      if (response.data.success) {
        setBadges(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load badges list", err);
    } finally {
      setLoadingBadges(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Draw frame to canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      // Mirror frame logic to match video element
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to Base64
      const dataUrl = canvas.toDataURL('image/jpeg');
      setProfilePic(dataUrl);
      
      // Stop stream
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
      setCameraActive(false);
      toast.success('Photo captured successfully!');
    }
  };

  const closeCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setCameraActive(false);
  };

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      const payload = {
        username: data.username,
        profilePicture: profilePic || null
      };
      
      const response = await api.put('/api/users/me', payload);
      if (response.data.success) {
        toast.success('Profile details updated successfully');
        updateUserState(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Determine Badge Rank / Level
  const earnedBadgesCount = badges.filter(b => b.awarded).length;
  let rankName = 'Eco-Novice 🍃';
  let rankColor = 'text-slate-500 bg-slate-100 dark:bg-slate-800';
  if (earnedBadgesCount >= 6) {
    rankName = 'Forest Guardian 🌳';
    rankColor = 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/40';
  } else if (earnedBadgesCount >= 3) {
    rankName = 'Planet Advocate 🌱';
    rankColor = 'text-primary-600 bg-primary-100 dark:bg-primary-950/40';
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Green ID Card & Edit profile details */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* GREEN ID CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 dark:from-emerald-700 dark:to-teal-950 border border-emerald-500/30 text-white rounded-3xl shadow-xl shadow-emerald-500/10 p-6 flex flex-col justify-between aspect-[1.586/1]">
          {/* Card Holographic Background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex justify-between items-start z-10">
            <div>
              <h3 className="text-xs font-bold tracking-widest text-emerald-200 uppercase">Green Identity Card</h3>
              <p className="text-[10px] text-emerald-300 font-semibold tracking-wider">CarbonMitra System Pass</p>
            </div>
            <span className="text-xl">🌍</span>
          </div>

          {/* ID Body */}
          <div className="flex items-center space-x-4 my-4 z-10">
            {/* Avatar container */}
            <div className="w-20 h-20 rounded-2xl border-2 border-emerald-400/40 bg-emerald-900/50 flex items-center justify-center overflow-hidden relative shadow-inner">
              {profilePic ? (
                <img src={profilePic} alt="Holo Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-3xl text-emerald-200 font-bold uppercase">
                  {user?.username?.charAt(0) || 'U'}
                </div>
              )}
              {/* Holo Overlay Stamp */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none animate-pulse"></div>
            </div>

            {/* Info details */}
            <div className="space-y-1 text-xs">
              <div className="font-extrabold text-base tracking-tight text-white flex items-center space-x-1.5">
                <span>{user?.username}</span>
                <Sparkles size={14} className="text-emerald-300 fill-emerald-300/30 animate-pulse" />
              </div>
              <p className="text-[10px] text-emerald-200 tracking-wide font-mono select-all">
                ID: CM-{user?.id?.toString().padStart(6, '0')}
              </p>
              <div className="flex flex-col pt-0.5 space-y-0.5">
                <span className="text-[9px] text-emerald-300 uppercase tracking-widest">Sustainability Tier</span>
                <span className="font-bold text-[10px] text-emerald-100">{rankName}</span>
              </div>
            </div>
          </div>

          {/* Footer details */}
          <div className="flex justify-between items-end border-t border-white/10 pt-2 z-10 text-[9px] font-mono tracking-wider text-emerald-200">
            <div>
              <p className="text-[8px] uppercase tracking-widest text-emerald-300">Authority Issuer</p>
              <p className="font-bold">CarbonMitra Global</p>
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-widest text-emerald-300">Status</p>
              <p className="font-bold text-emerald-300 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-ping"></span>
                ACTIVE PASS
              </p>
            </div>
          </div>
        </div>

        {/* PROFILE SETTINGS FORM */}
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl">
          <h2 className="text-xl font-extrabold mb-6 flex items-center space-x-2">
            <User size={20} className="text-primary-500" />
            <span>Profile Settings</span>
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* PROFILE PICTURE SELECTOR */}
            <div className="flex flex-col items-center py-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-dark-800 overflow-hidden bg-slate-50 dark:bg-dark-800 flex items-center justify-center relative shadow-sm">
                  {profilePic ? (
                    <img src={profilePic} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-slate-400" />
                  )}
                </div>
                {/* Upload Button */}
                <label 
                  htmlFor="profile-pic-upload"
                  title="Upload from File"
                  className="absolute bottom-0 right-8 bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700 transition cursor-pointer"
                >
                  <Camera size={12} />
                </label>
                <input 
                  type="file" 
                  id="profile-pic-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Camera Button */}
                <button
                  type="button"
                  onClick={() => setCameraActive(true)}
                  title="Capture from Camera"
                  className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-md hover:bg-emerald-700 transition"
                >
                  <Video size={12} />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-2">Upload image or use camera</span>
            </div>

            {/* USERNAME */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Username
              </label>
              <input
                type="text"
                {...register('username', { required: 'Username is required' })}
                className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100 ${errors.username ? 'border-red-500' : ''}`}
              />
              {errors.username && (
                <span className="text-xs text-red-500 mt-1 block">{errors.username.message}</span>
              )}
            </div>

            {/* EMAIL (LOCKED) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Email Address (Cannot be modified)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border bg-slate-100 dark:bg-dark-900 border-slate-200/60 dark:border-dark-800 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed outline-none"
              />
            </div>

            {/* SECURITY WARNING / PASSWORD EXPLANATION */}
            <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/30 rounded-2xl flex items-start space-x-2 text-[11px] text-red-600/90 dark:text-red-400/90 leading-relaxed">
              <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
              <p>
                <strong>Security:</strong> Passwords cannot be modified directly from this settings form. If you want to change your password, please use the <strong>Forgot Password</strong> flow from the Login screen.
              </p>
            </div>

            {/* ADDITIONAL SYSTEM METADATA */}
            <div className="pt-2">
              <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-dark-800">
                <span>Account Authority</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Source</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">System Role</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.role?.replace('ROLE_', '')}</span>
                </div>
                {user?.organizationName && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Organization</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{user.organizationName}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-primary-600/20 dark:shadow-primary-600/10 transition duration-150 flex items-center justify-center space-x-2"
            >
              <span>{updating ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Awarded Badges */}
      <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold flex items-center space-x-2">
            <AwardIcon size={20} className="text-primary-500" />
            <span>Awarded Badges</span>
          </h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${rankColor}`}>
            {rankName}
          </span>
        </div>

        {loadingBadges ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : badges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {badges.map((badge) => (
              <div 
                key={badge.id} 
                className={`flex flex-col items-center text-center p-5 rounded-3xl border transition duration-300
                  ${badge.awarded 
                    ? 'bg-gradient-to-b from-primary-50/50 to-white dark:from-primary-950/20 dark:to-dark-900 border-primary-100 dark:border-primary-900/40 shadow-sm shadow-primary-500/5' 
                    : 'bg-slate-50/50 dark:bg-dark-800/30 border-slate-100 dark:border-dark-800/60 opacity-60'}`}
              >
                <div className="relative">
                  <span className={`text-5xl ${badge.awarded ? 'filter-none' : 'filter grayscale'}`}>
                    🏅
                  </span>
                  {!badge.awarded && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Key size={18} className="bg-slate-200 dark:bg-dark-700 p-0.5 rounded-full" />
                    </div>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 mt-4">{badge.name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[170px] min-h-[32px] leading-relaxed">
                  {badge.description}
                </p>

                {badge.awarded ? (
                  <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 mt-3 flex items-center">
                    <Sparkles size={10} className="mr-1" />
                    Earned {new Date(badge.awardedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <p>No badges loaded.</p>
          </div>
        )}
      </div>

      {/* CAMERA CAPTURE MODAL OVERLAY */}
      {cameraActive && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={closeCamera}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center space-x-2">
              <Video size={20} className="text-emerald-500" />
              <span>Capture Profile Photo</span>
            </h3>

            {/* Video Viewport */}
            <div className="relative aspect-square w-full rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-100 dark:border-dark-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              {!videoStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              )}
            </div>

            {/* Hidden canvas for snapshotting */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-6 flex space-x-3">
              <button
                type="button"
                onClick={handleCapture}
                disabled={!videoStream}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Capture Photo
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="px-4 border border-slate-200 dark:border-dark-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-dark-800 transition duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
