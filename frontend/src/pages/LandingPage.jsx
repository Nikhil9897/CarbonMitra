import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import gsap from 'gsap';
import { 
  ArrowRight, 
  ChevronDown, 
  Shield, 
  Activity, 
  BarChart3, 
  TrendingDown, 
  Layers, 
  FileSpreadsheet, 
  Sparkles, 
  Zap, 
  Users, 
  Globe, 
  Award, 
  Check, 
  Plus, 
  Minus,
  MessageSquare,
  Volume2,
  Mail,
  Linkedin,
  Twitter,
  Github
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('hasLoadedIntro');
  });
  const [loadingProgress, setLoadingProgress] = useState(() => {
    return sessionStorage.getItem('hasLoadedIntro') ? 100 : 0;
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('realtime');
  const [carbonCounter, setCarbonCounter] = useState(9467229.418);

  // Background Canvas Ref for Particle System
  const canvasRef = useRef(null);

  // Counter loop for live carbon count
  useEffect(() => {
    const timer = setInterval(() => {
      setCarbonCounter(prev => prev + 0.137);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  // Loading Screen progress logic
  useEffect(() => {
    if (!loading) return;
    
    const duration = 2400; // 2.4s loading
    const interval = 30;
    const step = 100 / (duration / interval);
    
    const progressTimer = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(progressTimer);
          // Small delay before transition
          setTimeout(() => {
            gsap.to('.loader-container', {
              opacity: 0,
              duration: 0.8,
              ease: 'power3.inOut',
              onComplete: () => {
                setLoading(false);
                sessionStorage.setItem('hasLoadedIntro', 'true');
              }
            });
          }, 200);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [loading]);

  // Navbar scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Canvas Particle System
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.color = `rgba(16, 185, 129, ${Math.random() * 0.25 + 0.1})`;
      }

      update(mouseX, mouseY) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction
        if (mouseX && mouseY) {
          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const dist = Math.sqrt(dx * dx + dx * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
          }
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 90 }, () => new Particle());
    let mouse = { x: null, y: null };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, 0, width, height);

      // Draw background subtle grid lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach(p => {
        p.update(mouse.x, mouse.y);
        p.draw();
      });

      // Draw connections
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.strokeStyle = `rgba(0, 245, 160, ${(110 - dist) * 0.0012})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [loading]);

  // Framer Motion properties for Page elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  // Card Parallax Hover logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const handleMouseMoveDashboard = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / 25);
    y.set(mouseY / 25);
  };

  const handleMouseLeaveDashboard = () => {
    x.set(0);
    y.set(0);
  };

  // Pricing pricing data
  const pricingPlans = [
    {
      name: 'Starter',
      price: '$499',
      period: '/month',
      desc: 'Ideal for growing startups initiating their sustainability audits.',
      features: [
        'Up to 3 scopes tracker',
        'Basic AI chatbot advice',
        'Manual PDF report generation',
        '1 Admin seat',
        'Standard dashboard analytics'
      ],
      popular: false,
      btnText: 'Start Trial'
    },
    {
      name: 'Professional',
      price: '$1,499',
      period: '/month',
      desc: 'Advanced dashboard metrics for mid-sized organizations with deep compliance requirements.',
      features: [
        'All Scope 1, 2, & 3 tracking',
        'Full AI Sustainability Chatbot integration',
        'Automated regulatory compliance reporting',
        '5 Admin seats + department tracking',
        'Interactive route optimization engine',
        'Premium glassmorphic certificate generator'
      ],
      popular: true,
      btnText: 'Go Professional'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'Tailored capabilities for global conglomerates requiring auditing pipelines.',
      features: [
        'Infinite active users & organizations',
        'Dedicated SLA & custom API integrations',
        'High-performance analytics data pipelines',
        'Audit-ready exports signed with cryptographic hashes',
        '24/7 dedicated climatologist consultant support',
        'Custom white-label dashboard and portals'
      ],
      popular: false,
      btnText: 'Contact Sales'
    }
  ];

  // FAQ data
  const faqs = [
    {
      q: "What is CarbonMitra's underlying science database?",
      a: "Our system operates on verified global emission factors including IPCC, GHG Protocol, DEFRA, and US EPA guidelines. All data points are updated dynamically each quarter to ensure compliance with SEC, CSRD, and local reporting metrics."
    },
    {
      q: "Can we connect existing ERP pipelines like SAP or Salesforce?",
      a: "Absolutely. CarbonMitra Enterprise offers out-of-the-box REST APIs and webhooks to synchronize energy data, logistical fuel trackers, and shipping logs directly into our ingestion engine."
    },
    {
      q: "How does the AI assistant help in reduction strategies?",
      a: "The AI Sustainability Advisor analyses your logged data points (Scope 1, 2, 3), predicts trends, highlights operational inefficiencies, and compiles context-aware green recommendations using integrated neural intelligence."
    },
    {
      q: "How are Carbon Certificates verified?",
      a: "Every certificate issued contains a unique cryptographic hash and verification URL. Any third-party auditing body can scan this to verify your actual documented carbon offsets and reduction metrics securely."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen relative font-sans overflow-x-hidden selection:bg-[#00F5A0]/30 selection:text-emerald-950">
      
      {/* 1. Loading Screen */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            className="loader-container fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
          >
            {/* Glowing Logo */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="relative mb-8"
            >
              {/* Radial Blur Backdrop */}
              <div className="absolute inset-0 bg-[#00F5A0] opacity-25 filter blur-2xl rounded-full scale-125 animate-pulse"></div>
              
              {/* Logo image with drop shadow glow */}
              <img 
                src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
                alt="CarbonMitra Logo" 
                className="w-24 h-24 object-contain relative z-10"
                style={{ filter: 'drop-shadow(0 0 20px rgba(0, 245, 160, 0.6))' }}
              />
            </motion.div>

            {/* Platform Text */}
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold tracking-[0.3em] uppercase text-slate-900 font-mono flex items-center gap-1.5"
            >
              Carbon<span className="text-emerald-500">Mitra</span>
            </motion.h1>

            {/* Progress Percentage */}
            <motion.div className="mt-6 text-sm font-mono text-emerald-600">
              {Math.min(100, Math.floor(loadingProgress))}%
            </motion.div>

            {/* Slider bar */}
            <div className="w-48 h-[1px] bg-slate-200 mt-2 relative overflow-hidden rounded-full">
              <motion.div 
                className="absolute left-0 top-0 bottom-0 bg-emerald-500"
                style={{ width: `${loadingProgress}%` }}
              ></motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Interactive Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .text-glow {
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.35);
        }
        .border-glow {
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.06);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(16, 185, 129, 0.12);
        }
        .glass-card-hover:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(16, 185, 129, 0.35);
          box-shadow: 0 10px 35px rgba(16, 185, 129, 0.1);
        }
        .neon-accent-bg {
          background: linear-gradient(135deg, #00F5A0 0%, #16E6B2 100%);
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.25);
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #00F5A0;
        }
      `}} />

      {/* 2. Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        isScrolled ? 'py-4 bg-white/85 backdrop-blur-xl border-b border-slate-200/60 shadow-sm' : 'py-7 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <img 
              src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
              alt="CarbonMitra Logo" 
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="hidden sm:inline font-mono text-lg font-bold tracking-[0.2em] uppercase text-slate-900">
              Carbon<span className="text-emerald-500">Mitra</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#hero" className="hover:text-emerald-600 transition duration-200">Home</a>
            <a href="#mission" className="hover:text-emerald-600 transition duration-200">Platform</a>
            <a href="#timeline" className="hover:text-emerald-600 transition duration-200">Solutions</a>
            <a href="#features" className="hover:text-emerald-600 transition duration-200">Features</a>
            <a href="#pricing" className="hover:text-emerald-600 transition duration-200">Pricing</a>
          </nav>

          {/* Dashboard/Auth Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {user ? (
              <button 
                onClick={() => navigate('/dashboard')} 
                className="text-xs sm:text-sm font-bold neon-accent-bg text-black hover:scale-[1.03] transition-all duration-200 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full shadow-lg shadow-[#00f5a0]/15"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors py-2 px-2.5 sm:px-4"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="text-xs sm:text-sm font-bold neon-accent-bg text-black hover:scale-[1.03] transition-all duration-200 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg shadow-[#00f5a0]/15"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section id="hero" className="min-h-[80vh] md:min-h-screen relative flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Windmill Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-0 transition-opacity duration-1000"
          onLoadedData={(e) => e.target.classList.remove('opacity-0')}
        >
          <source src="/windmill.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Soft eco-overlay for text contrast (video 80% visible) */}
        <div className="absolute inset-0 bg-[#F8FCF8]/20 backdrop-blur-[0.5px] z-0"></div>

        <div className="max-w-4xl mx-auto px-6 md:px-12 w-full flex flex-col items-center text-center relative z-10">
          
          {/* Centered Hero Text */}
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-slate-200/60 text-xs font-mono text-emerald-600 w-fit mb-6"
            >
              <Sparkles size={12} className="animate-pulse" />
              <span>COHERE AI ECO-ASSISTANT INTEGRATED</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900 uppercase font-sans mb-6"
            >
              Measure. Reduce. <span className="text-emerald-600 text-glow">Lead the Future.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25 }}
              className="text-slate-650 text-lg max-w-2xl mb-10 leading-relaxed font-sans font-semibold"
            >
              CarbonMitra is an enterprise-grade carbon accounting platform helping organizations monitor emissions, automate ESG reporting, and achieve verifiable net-zero compliance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.35 }}
              className="flex flex-wrap gap-4 items-center justify-center"
            >
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/register')} 
                className="neon-accent-bg text-black font-extrabold px-8 py-4 rounded-full flex items-center gap-2 hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-[#00f5a0]/15"
              >
                <span>{user ? 'Go to Dashboard' : 'Get Started'}</span>
                <ArrowRight size={18} />
              </button>
              
              <a 
                href="#pricing"
                className="glass-card hover:bg-slate-100/50 border-slate-200 font-bold px-8 py-4 rounded-full flex items-center justify-center transition-all duration-200 hover:border-slate-300 text-slate-800"
              >
                Book Demo
              </a>
            </motion.div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition duration-200 select-none">
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-slate-400">Scroll to Explore</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="text-[#00F5A0]"
          >
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </section>

      {/* 4. Section 2: Mission */}
      <section id="mission" className="py-28 relative border-t border-slate-200/50 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(22,230,178,0.015)_0%,transparent_60%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text details */}
          <div className="lg:col-span-7">
            <span className="text-emerald-600 font-mono text-xs tracking-[0.35em] uppercase font-bold block mb-4">OUR MISSION</span>
            <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-slate-900 mb-8">
              Your Partner in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-emerald-600">Net Zero compliance.</span>
            </h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                As compliance frameworks tighten globally, reporting carbon offsets is no longer a secondary objective. Enterprises require robust auditing trails mapping directly back to verified energy consumption vectors.
              </p>
              <p>
                CarbonMitra supplies absolute visibility over Scope 1, 2, and 3 emissions, bridging raw logistics data with actionable analytics dashboards and regulatory assurance mechanisms.
              </p>
            </div>
            
            <div className="mt-10">
              <button 
                onClick={() => navigate(user ? '/dashboard' : '/register')} 
                className="group inline-flex items-center gap-3 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition duration-200"
              >
                <span>Discover Platform Scope</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition duration-200" />
              </button>
            </div>
          </div>

          {/* Right Holographic Glass Card */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div 
              whileHover={{ rotateY: -10, rotateX: 10 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="w-full max-w-[400px] aspect-[4/5] glass-card rounded-[24px] border-white/10 flex flex-col justify-between p-8 relative overflow-hidden group shadow-2xl border-glow"
            >
              {/* Glow mesh inside card */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-[#00F5A0]/10 filter blur-[80px] rounded-full group-hover:scale-125 transition-all duration-500"></div>

              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00F5A0]">
                  <Shield size={24} />
                </div>
                <span className="text-xs font-mono text-slate-500">SEC AUDIT COMPLIANT</span>
              </div>

              <div>
                <span className="text-slate-400 font-mono text-[11px] block mb-2 uppercase tracking-widest">INGESTION PIPELINE SECURITY</span>
                <h3 className="text-2xl font-bold uppercase tracking-tight text-white mb-3">
                  Cryptographic Trust
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every emission record is cryptographically indexed and verified to create a tamper-proof carbon offset trail ready for compliance auditors.
                </p>
              </div>

              {/* Progress counter simulation */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                  <span>AUDIT READINESS SCORE</span>
                  <span className="text-[#00F5A0]">100%</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00F5A0] to-[#16E6B2]" style={{ width: '100%' }}></div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 5. Section 3: How It Works */}
      <section id="timeline" className="py-28 relative border-t border-slate-200/50 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16">
          <span className="text-emerald-600 font-mono text-xs tracking-[0.35em] uppercase font-bold block mb-4">INGESTION METHODOLOGY</span>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900 mb-6">
            Four Steps to Net Zero Compliance
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            From disparate raw data fields to a unified, audit-ready emission interface in real time.
          </p>
        </div>

        {/* Horizontal Timeline Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-[24px] border-slate-200/60 relative group glass-card-hover hover:-translate-y-2 transition-all duration-300">
            <div className="absolute top-6 right-8 text-5xl font-bold font-mono text-slate-200/50">01</div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
              <Layers size={22} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 mb-3">Collect Data</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ingest logistical fuel databases, electricity invoices, utility logs, and transport details automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-[24px] border-slate-200/60 relative group glass-card-hover hover:-translate-y-2 transition-all duration-300">
            <div className="absolute top-6 right-8 text-5xl font-bold font-mono text-slate-200/50">02</div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
              <BarChart3 size={22} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 mb-3">Analyze</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Verify emission metrics across Scope 1, 2, and 3 using dynamically updated global emission factor guidelines.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-[24px] border-slate-200/60 relative group glass-card-hover hover:-translate-y-2 transition-all duration-300">
            <div className="absolute top-6 right-8 text-5xl font-bold font-mono text-slate-200/50">03</div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
              <FileSpreadsheet size={22} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 mb-3">Report</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Compile auditor-friendly reports compliance-ready for SEC, CSRD, and local carbon audits instantly.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-8 rounded-[24px] border-slate-200/60 relative group glass-card-hover hover:-translate-y-2 transition-all duration-300">
            <div className="absolute top-6 right-8 text-5xl font-bold font-mono text-slate-200/50">04</div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
              <TrendingDown size={22} />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 mb-3">Optimize</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Deploy recommendations, optimize logistical operations, and log actual progress to scale offsets.
            </p>
          </div>

        </div>
      </section>

      {/* 6. Section 4: Features */}
      <section id="features" className="py-28 relative border-t border-slate-200/50 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,245,160,0.015)_0%,transparent_60%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-left mb-16">
            <span className="text-emerald-600 font-mono text-xs tracking-[0.35em] uppercase font-bold block mb-4">PLATFORM ABILITIES</span>
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900">
              Engineered for Sustainability Analytics
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-[24px] border-slate-200/60 group hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <Activity size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase">Real-Time Ingestion</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stream fuel tracking data, smart meter energy logs, and operational activity streams into a unified ledger.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-[24px] border-slate-200/60 group hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <Sparkles size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase">Cohere AI Integration</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chat with the AI Eco-Assistant, generate carbon audit reports, and get direct actionable carbon reduction strategies.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-[24px] border-slate-200/60 group hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase">Route Optimization</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Plan transit routes via OpenStreetMap mapping, compare vehicle offsets, and minimize transport emission impact.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-8 rounded-[24px] border-slate-200/60 group hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <Shield size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase">Cryptographic Audit</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide secure audit readiness scores and download verified cryptographic carbon offset certificates easily.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-8 rounded-[24px] border-slate-200/60 group hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <Layers size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase">Organizational Portals</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Organize sub-businesses, manage active departments, check leaderboard scores, and scale global controls.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-8 rounded-[24px] border-slate-200/60 group hover:-translate-y-1 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-6">
                <BarChart3 size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase">Compliance Engine</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Stay updated with the latest CSRD regulations and automatically generate customized regulatory filings.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Section 5: Interactive Dashboard Preview */}
      <section className="py-28 relative border-t border-slate-200/50 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-mono text-xs tracking-[0.35em] uppercase font-bold block mb-4">ENTERPRISE INTERACTION</span>
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900 mb-6">
              Interactive Dashboard Preview
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Test out our clean interface. Swap tabs to explore carbon offset visualisations.
            </p>
          </div>

          {/* Interactive tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button 
              onClick={() => setActiveTab('realtime')}
              className={`px-6 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase border transition duration-200 ${
                activeTab === 'realtime' 
                ? 'bg-[#00F5A0] border-[#00F5A0] text-black font-extrabold' 
                : 'glass-card border-slate-200 text-slate-600 hover:text-slate-800'
              }`}
            >
              Real-time Ingestion
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2.5 rounded-full text-xs font-mono tracking-wider uppercase border transition duration-200 ${
                activeTab === 'analytics' 
                ? 'bg-[#00F5A0] border-[#00F5A0] text-black font-extrabold' 
                : 'glass-card border-slate-200 text-slate-600 hover:text-slate-800'
              }`}
            >
              Optimized Projections
            </button>
          </div>

          {/* Tab Screen Glass Frame */}
          <div className="glass-card p-6 rounded-[32px] border-slate-200/60 shadow-2xl relative max-w-4xl mx-auto border-glow">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/40"></span>
                <span className="w-3 h-3 rounded-full bg-yellow-500/40"></span>
                <span className="w-3 h-3 rounded-full bg-green-500/40"></span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">CARBONMITRA DATA INGESTION ENGINE</span>
              <span className="w-6"></span>
            </div>

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left widgets */}
              <div className="md:col-span-1 space-y-4">
                <div className="glass-card p-5 rounded-2xl border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Scope 1 Offset</span>
                  <div className="text-xl font-bold font-mono">1,418 t CO₂</div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">✔ In compliance bounds</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Scope 2 Offset</span>
                  <div className="text-xl font-bold font-mono">2,110 t CO₂</div>
                  <span className="text-[10px] text-emerald-400 mt-1 block">✔ Grid emission synced</span>
                </div>
                <div className="glass-card p-5 rounded-2xl border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Scope 3 Offset</span>
                  <div className="text-xl font-bold font-mono">4,906 t CO₂</div>
                  <span className="text-[10px] text-yellow-400 mt-1 block">⚠ Awaiting logistics sync</span>
                </div>
              </div>

              {/* Main Graph Box */}
              <div className="md:col-span-2 glass-card p-6 rounded-2xl border-white/5 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase">Ingestion Path Analysis</h4>
                    <span className="text-[10px] font-mono text-slate-500">Dynamic tracking metrics (Daily resolution)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00F5A0] inline-block"></span>
                    <span className="text-[9px] font-mono text-slate-400">Emission Factors</span>
                  </div>
                </div>

                {/* SVG Chart depending on tab */}
                <div className="h-44 flex items-end">
                  <svg className="w-full h-full" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="tabGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#00F5A0" stopOpacity="0"/>
                      </linearGradient>
                    </defs>

                    {activeTab === 'realtime' ? (
                      <>
                        <path d="M 0 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 40 C 350 0, 420 50, 500 20 L 500 150 L 0 150 Z" fill="url(#tabGrad)" />
                        <motion.path 
                          d="M 0 130 C 50 110, 100 120, 150 90 C 200 60, 250 80, 300 40 C 350 0, 420 50, 500 20" 
                          fill="none" stroke="#00F5A0" strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                        />
                        <circle cx="500" cy="20" r="4" fill="#00F5A0" />
                      </>
                    ) : (
                      <>
                        <path d="M 0 100 C 70 80, 120 40, 200 30 C 280 20, 380 10, 500 5 L 500 150 L 0 150 Z" fill="url(#tabGrad)" />
                        <motion.path 
                          d="M 0 100 C 70 80, 120 40, 200 30 C 280 20, 380 10, 500 5" 
                          fill="none" stroke="#00F5A0" strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                        />
                        <circle cx="500" cy="5" r="4" fill="#00F5A0" />
                      </>
                    )}
                  </svg>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 8. Section 6: Statistics Counters */}
      <section className="py-24 relative border-t border-slate-200/50 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-extrabold text-emerald-600 tracking-tight font-mono text-glow">50+</span>
              <span className="text-xs uppercase font-mono text-slate-600 tracking-widest mt-2">Countries Monitored</span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-extrabold text-emerald-600 tracking-tight font-mono text-glow">10M+</span>
              <span className="text-xs uppercase font-mono text-slate-600 tracking-widest mt-2">Carbon Records Logged</span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-extrabold text-emerald-600 tracking-tight font-mono text-glow">2500+</span>
              <span className="text-xs uppercase font-mono text-slate-600 tracking-widest mt-2">Global Organizations</span>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-6xl font-extrabold text-emerald-600 tracking-tight font-mono text-glow">99.9%</span>
              <span className="text-xs uppercase font-mono text-slate-600 tracking-widest mt-2">Ingestion Accuracy</span>
            </div>

          </div>

        </div>
      </section>

      {/* 9. Section 7: Testimonials Slider */}
      <section className="py-28 relative border-t border-slate-200/50 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16">
          <span className="text-emerald-600 font-mono text-xs tracking-[0.35em] uppercase font-bold block mb-4">GLOBAL ASSURANCE</span>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900 mb-6">
            Trusted by Enterprise Auditors
          </h2>
        </div>

        {/* Horizontal scroll containing mock reviews */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="glass-card p-8 rounded-[24px] border-slate-200/60 flex flex-col justify-between h-72">
            <div className="flex items-center gap-1 text-emerald-600">
              <Award size={18} />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600">SEC audit pass</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic my-6">
              "CarbonMitra consolidated our Scope 1 and 2 logistics inputs in under two weeks. Our global auditors were completely satisfied with the cryptographic hash audit trails."
            </p>
            <div>
              <div className="text-sm font-bold text-slate-900">Milind Verma</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Director of Sustainability, PATtech</div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-8 rounded-[24px] border-slate-200/60 flex flex-col justify-between h-72">
            <div className="flex items-center gap-1 text-emerald-600">
              <Award size={18} />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600">CSRD ready</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic my-6">
              "The integration of the Cohere AI Eco-Assistant allowed us to optimize route deviations directly, leading to a verified 14.2% carbon reduction in our shipping fleet."
            </p>
            <div>
              <div className="text-sm font-bold text-slate-900">Sarah Jenkins</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">VP Compliance, EcoLogistics</div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-8 rounded-[24px] border-slate-200/60 flex flex-col justify-between h-72">
            <div className="flex items-center gap-1 text-emerald-600">
              <Award size={18} />
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-600">ISO 14064 Compliant</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed italic my-6">
              "The automatic generation of certificate hashes has completely streamlined our quarterly climate dashboard reporting. We save hundreds of hours of auditing labor."
            </p>
            <div>
              <div className="text-sm font-bold text-slate-900">David Kael</div>
              <div className="text-[10px] font-mono text-slate-500 uppercase">Principal Auditor, GreenTech Assurance</div>
            </div>
          </div>

        </div>
      </section>

      {/* 10. Section 8: Pricing */}
      <section id="pricing" className="py-28 relative border-t border-slate-200/50 bg-slate-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(0,245,160,0.02)_0%,transparent_60%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-16">
          <span className="text-emerald-600 font-mono text-xs tracking-[0.35em] uppercase font-bold block mb-4">PRICING TIERS</span>
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900 mb-6">
            Predictable Plans for Every Stage
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Choose the operational tracking scale required for your business compliance pipeline.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`glass-card rounded-[32px] p-8 border-slate-200/60 flex flex-col justify-between relative group hover:border-[#00F5A0]/30 transition-all duration-300 ${
                plan.popular ? 'border-[#00F5A0]/30 bg-white border-glow shadow-xl' : 'bg-white/80'
              }`}
            >
              {/* Popular Glow Indicator */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00F5A0] text-black font-mono text-[9px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Highly Popular
                </div>
              )}

              <div>
                <span className="text-sm font-mono text-emerald-600 uppercase tracking-wider block mb-4">{plan.name}</span>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-4xl md:text-5xl font-extrabold font-mono tracking-tight text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500 font-mono">{plan.period}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6 border-b border-slate-100 pb-6">
                  {plan.desc}
                </p>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <span className="text-emerald-600 mt-0.5"><Check size={14} /></span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => navigate(user ? '/dashboard' : '/register')}
                className={`w-full py-4 rounded-full text-xs font-mono uppercase tracking-widest transition duration-200 ${
                  plan.popular 
                  ? 'neon-accent-bg text-black font-extrabold hover:scale-[1.02]' 
                  : 'glass-card border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                {plan.btnText}
              </button>
            </div>
          ))}

        </div>
      </section>

      {/* 11. Section 9: FAQ Accordions */}
      <section className="py-28 relative border-t border-slate-200/50 bg-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-mono text-xs tracking-[0.35em] uppercase font-bold block mb-4">COMPLIANCE FAQ</span>
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-slate-900 mb-6">
              Frequently Answered
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index}
                  className="glass-card rounded-[20px] border-slate-200/50 overflow-hidden transition-all duration-300"
                >
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-6 md:p-8 flex justify-between items-center text-sm md:text-base font-bold text-slate-800 hover:text-emerald-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400">
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-slate-200/40"
                      >
                        <div className="p-6 md:p-8 text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50/30">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 12. Section 10: Call To Action */}
      <section className="py-32 relative border-t border-slate-200/50 bg-white overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_60%)] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center relative z-10">
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-slate-900 mb-8"
          >
            Ready to Build a <br />
            <span className="text-emerald-600 text-glow">Sustainable Future?</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-lg max-w-xl mx-auto mb-12"
          >
            Create your account today. Log Scope 1, 2, and 3 emissions seamlessly with our high-performance audit framework.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center items-center"
          >
            <button 
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="neon-accent-bg text-black font-extrabold px-8 py-4 rounded-full hover:scale-[1.03] transition-all duration-200 shadow-xl shadow-[#00f5a0]/15"
            >
              {user ? 'Go to Dashboard' : 'Start Now'}
            </button>
            <a 
              href="#pricing"
              className="glass-card hover:bg-slate-100/50 border-slate-200 font-bold px-8 py-4 rounded-full flex items-center justify-center transition-all duration-200 hover:border-slate-300 text-slate-800"
            >
              Book Demo
            </a>
          </motion.div>

        </div>
      </section>

      {/* 13. Footer */}
      <footer className="py-16 border-t border-slate-200 bg-white text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          
          {/* Brand info */}
          <div className="md:col-span-6 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dngurjsdw/image/upload/v1783233674/carbon_tracker_ojorhq.png" 
                alt="CarbonMitra Logo" 
                className="h-8 w-auto object-contain"
              />
              <span className="font-mono text-base font-bold tracking-[0.2em] uppercase text-slate-900">
                Carbon<span className="text-emerald-500">Mitra</span>
              </span>
            </Link>
            <p className="text-xs max-w-sm leading-relaxed text-slate-600">
              The premium, audit-ready sustainability and emission compliance accounting portal for global organizations.
            </p>
          </div>

          {/* Nav links */}
          <div className="md:col-span-3 space-y-3.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">ORGANIZATION</span>
            <ul className="text-xs space-y-2 text-slate-600">
              <li><a href="#hero" className="hover:text-emerald-600 transition">Platform</a></li>
              <li><a href="#features" className="hover:text-emerald-600 transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-emerald-600 transition">Tiers & Pricing</a></li>
            </ul>
          </div>

          {/* Support links */}
          <div className="md:col-span-3 space-y-3.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">SUPPORT</span>
            <ul className="text-xs space-y-2 text-slate-600">
              <li><a href="#hero" className="hover:text-emerald-600 transition">Documentation</a></li>
              <li><a href="#hero" className="hover:text-emerald-600 transition">API Status</a></li>
              <li><a href="#hero" className="hover:text-emerald-600 transition">Security Guidelines</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom row */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>Copyright © 2026 CarbonMitra Inc. All rights reserved. | #madewithmilind</span>
          <div className="flex gap-4 text-slate-400">
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition"><Linkedin size={16} /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition"><Twitter size={16} /></a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition"><Github size={16} /></a>
          </div>
        </div>
      </footer>

    </div>
  );
}
