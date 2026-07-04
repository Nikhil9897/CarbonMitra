import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line,
  CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/api/analytics');
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Formatting historical trend
  const trendData = analytics?.monthlyTrend 
    ? Object.keys(analytics.monthlyTrend).map(date => ({
        date: date.substring(5), // MM-DD
        quantity: analytics.monthlyTrend[date]
      }))
    : [];

  // Formatting category breakdown
  const categoryData = analytics?.categoryBreakdown
    ? Object.keys(analytics.categoryBreakdown).map((key, idx) => ({
        category: key,
        value: analytics.categoryBreakdown[key],
        fill: COLORS[idx % COLORS.length]
      })).filter(c => c.value > 0)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Sustainability Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400">Deep dive into your daily activity history, footprints, and category comparisons.</p>
      </div>

      {/* Grid of aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">Today's Total</p>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{analytics?.todayCo2 || 0} kg</h2>
          <p className="text-[11px] text-slate-400 mt-2">Carbon generated today relative to 15 kg avg.</p>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">Weekly Aggregate</p>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{analytics?.weeklyCo2 || 0} kg</h2>
          <p className="text-[11px] text-slate-400 mt-2">Aggregated carbon generated in the last 7 days.</p>
        </div>
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-1">Monthly Aggregate</p>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">{analytics?.monthlyCo2 || 0} kg</h2>
          <p className="text-[11px] text-slate-400 mt-2">Aggregated carbon generated in the last 30 days.</p>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Daily Trend line chart */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
            <TrendingUp size={18} className="text-primary-500" />
            <span>30-Day Daily Footprint Trend</span>
          </h3>
          <div className="h-80 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Line type="monotone" dataKey="quantity" stroke="#22c55e" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No trend data logged.</div>
            )}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl">
          <h3 className="text-lg font-bold mb-6 flex items-center space-x-2">
            <BarChart3 size={18} className="text-primary-500" />
            <span>Category Comparison</span>
          </h3>
          <div className="h-80 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No emissions logged yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Insights */}
      {categoryData.length > 0 && (
        <div className="bg-gradient-to-r from-primary-600 to-emerald-500 text-white p-6 rounded-3xl flex items-start space-x-4">
          <div className="p-3 bg-white/20 rounded-2xl">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-lg">AI Carbon Insight</h4>
            <p className="text-white/80 text-sm mt-1 leading-relaxed">
              Your highest emissions stem from {categoryData.sort((a,b) => b.value - a.value)[0]?.category} activities. 
              Reducing outputs in this segment by just 10% next week will save approximately {(categoryData.sort((a,b) => b.value - a.value)[0]?.value * 0.1).toFixed(1)} kg of CO₂e! 
              Check your Dashboard recommendations for quick actionable steps.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
