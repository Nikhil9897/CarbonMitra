import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  Activity, 
  Calendar, 
  Target, 
  Trophy, 
  Lightbulb, 
  Award, 
  PlusCircle, 
  TrendingDown,
  ChevronRight
} from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, recRes, leaderRes, badgesRes, goalsRes] = await Promise.all([
          api.get('/api/analytics'),
          api.get('/api/recommendations'),
          api.get('/api/leaderboard'),
          api.get('/api/badges'),
          api.get('/api/goals')
        ]);

        if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
        if (recRes.data.success) setRecommendations(recRes.data.data);
        if (leaderRes.data.success) setLeaderboard(leaderRes.data.data.slice(0, 5));
        if (badgesRes.data.success) setBadges(badgesRes.data.data.filter(b => b.awarded).slice(0, 3));
        if (goalsRes.data.success) setGoals(goalsRes.data.data.filter(g => g.status === 'ACTIVE').slice(0, 1));
      } catch (error) {
        console.error("Error loading dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Format Recharts data
  const pieData = analytics?.categoryBreakdown 
    ? Object.keys(analytics.categoryBreakdown).map(key => ({
        name: key,
        value: analytics.categoryBreakdown[key]
      })).filter(item => item.value > 0)
    : [];

  const weeklyTrendData = analytics?.weeklyTrend
    ? Object.keys(analytics.weeklyTrend).map(key => ({
        date: key.substring(5), // MM-DD
        emissions: analytics.weeklyTrend[key]
      }))
    : [];

  const activeGoal = goals[0];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Eco Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Here is your real-time environmental impact summary.</p>
        </div>
        <Link 
          to="/log-activity" 
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary-600/20 dark:shadow-primary-600/10 flex items-center space-x-2 transition"
        >
          <PlusCircle size={18} />
          <span>Log Carbon Activity</span>
        </Link>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Today's CO₂</p>
            <h3 className="text-2xl font-extrabold mt-1">{analytics?.todayCo2 || 0.0} <span className="text-sm font-normal text-slate-400">kg</span></h3>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Weekly CO₂</p>
            <h3 className="text-2xl font-extrabold mt-1">{analytics?.weeklyCo2 || 0.0} <span className="text-sm font-normal text-slate-400">kg</span></h3>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Monthly CO₂</p>
            <h3 className="text-2xl font-extrabold mt-1">{analytics?.monthlyCo2 || 0.0} <span className="text-sm font-normal text-slate-400">kg</span></h3>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-pink-100 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 rounded-xl">
            <Target size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Active Goal</p>
            {activeGoal ? (
              <div className="mt-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">Save {activeGoal.targetReduction} kg CO₂</h4>
                <div className="w-full bg-slate-100 dark:bg-dark-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-primary-500 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">No active goals</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts & Widgets section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <Calendar size={18} className="text-primary-500" />
            <span>Weekly Carbon Emissions Trend</span>
          </h3>
          <div className="h-72 w-full">
            {weeklyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrendData}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="emissions" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No trend data available</div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
            <Activity size={18} className="text-primary-500" />
            <span>Category Breakdown (30 Days)</span>
          </h3>
          <div className="h-72 w-full flex flex-col items-center justify-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
                  {pieData.map((item, idx) => (
                    <div key={item.name} className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center text-slate-400">No logs in the last 30 days</div>
            )}
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation Widget */}
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
              <Lightbulb size={18} className="text-amber-500" />
              <span>Smart Recommendations</span>
            </h3>
            {recommendations?.recommendationTips ? (
              <ul className="space-y-3 mt-4">
                {recommendations.recommendationTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 text-xs font-bold mt-0.5 flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 mt-4">No recommendations available</p>
            )}
          </div>
          <Link to="/analytics" className="text-primary-500 hover:text-primary-600 text-sm font-bold flex items-center space-x-1 mt-6 self-start group">
            <span>Explore full analytics</span>
            <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Leaderboard Widget */}
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <Trophy size={18} className="text-primary-500" />
              <span>Top Green Leaders</span>
            </h3>
            <div className="space-y-3.5">
              {leaderboard.length > 0 ? (
                leaderboard.map((item, idx) => (
                  <div key={item.userId} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-500 dark:bg-dark-800'}`}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item.username}</span>
                    </div>
                    <span className="font-bold text-slate-500 dark:text-slate-400">{item.totalCo2e} kg CO₂</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No leaderboard data</p>
              )}
            </div>
          </div>
          <Link to="/leaderboard" className="text-primary-500 hover:text-primary-600 text-sm font-bold flex items-center space-x-1 mt-6 self-start group">
            <span>View full leaderboard</span>
            <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition" />
          </Link>
        </div>

        {/* Badges Widget */}
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <Award size={18} className="text-primary-500" />
              <span>Your Achievements</span>
            </h3>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {badges.length > 0 ? (
                badges.map(badge => (
                  <div key={badge.id} className="flex flex-col items-center text-center p-2.5 bg-slate-50 dark:bg-dark-800/50 border border-slate-100 dark:border-dark-800 rounded-2xl">
                    <span className="text-3xl">🏅</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-2 truncate w-full" title={badge.name}>
                      {badge.name}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center text-sm text-slate-400 py-6">
                  No badges awarded yet. Start logging to earn achievements!
                </div>
              )}
            </div>
          </div>
          <Link to="/profile" className="text-primary-500 hover:text-primary-600 text-sm font-bold flex items-center space-x-1 mt-6 self-start group">
            <span>View all badges</span>
            <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
