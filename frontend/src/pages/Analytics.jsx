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
  LineChart, 
  Line,
  CartesianGrid
} from 'recharts';
import { BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import BackButton from '../components/BackButton';

const COLORS = ['#2E7D32', '#4CAF50', '#81C784', '#61af65', '#246227'];

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

  const trendData = analytics?.monthlyTrend 
    ? Object.keys(analytics.monthlyTrend).map(date => ({
        date: date.substring(5), 
        quantity: analytics.monthlyTrend[date]
      }))
    : [];

  const categoryData = analytics?.categoryBreakdown
    ? Object.keys(analytics.categoryBreakdown).map((key, idx) => ({
        category: key,
        value: analytics.categoryBreakdown[key],
        fill: COLORS[idx % COLORS.length]
      })).filter(c => c.value > 0)
    : [];

  return (
    <>
      <BackButton />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">Sustainability Analytics</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Deep dive into your daily activity history, footprints, and category comparisons.</p>
        </div>

        {/* Grid of aggregates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-borderEco p-6 rounded-3xl text-center shadow-sm hover:shadow-md transition">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Today's Total</p>
            <h2 className="text-4xl font-extrabold text-slate-800">{analytics?.todayCo2 || 0} kg</h2>
            <p className="text-[11px] text-slate-450 mt-2 font-semibold">Carbon generated today relative to 15 kg avg.</p>
          </div>
          <div className="bg-white border border-borderEco p-6 rounded-3xl text-center shadow-sm hover:shadow-md transition">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Weekly Aggregate</p>
            <h2 className="text-4xl font-extrabold text-slate-800">{analytics?.weeklyCo2 || 0} kg</h2>
            <p className="text-[11px] text-slate-450 mt-2 font-semibold">Aggregated carbon generated in the last 7 days.</p>
          </div>
          <div className="bg-white border border-borderEco p-6 rounded-3xl text-center shadow-sm hover:shadow-md transition">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Monthly Aggregate</p>
            <h2 className="text-4xl font-extrabold text-slate-800">{analytics?.monthlyCo2 || 0} kg</h2>
            <p className="text-[11px] text-slate-450 mt-2 font-semibold">Aggregated carbon generated in the last 30 days.</p>
          </div>
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Daily Trend Line Chart */}
          <div className="lg:col-span-2 bg-white border border-borderEco p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2 text-slate-800">
              <TrendingUp size={18} className="text-primary-500" />
              <span>30-Day Daily Footprint Trend</span>
            </h3>
            <div className="h-80 w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E5F3E7', borderRadius: '12px', color: '#1C2B22', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Line type="monotone" dataKey="quantity" stroke="#4CAF50" strokeWidth={3} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-semibold">No trend data logged.</div>
              )}
            </div>
          </div>

          {/* Category Breakdown Bar Chart */}
          <div className="bg-white border border-borderEco p-6 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center space-x-2 text-slate-800">
              <BarChart3 size={18} className="text-primary-500" />
              <span>Category Comparison</span>
            </h3>
            <div className="h-80 w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #E5F3E7', borderRadius: '12px', color: '#1C2B22', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-semibold">No emissions logged yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Insights */}
        {categoryData.length > 0 && (
          <div className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white p-6 rounded-3xl flex items-start space-x-4 shadow-md">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-lg">AI Carbon Insight</h4>
              <p className="text-white/90 text-sm mt-1 leading-relaxed font-semibold">
                Your highest emissions stem from {categoryData.sort((a,b) => b.value - a.value)[0]?.category} activities. 
                Reducing outputs in this segment by just 10% next week will save approximately {(categoryData.sort((a,b) => b.value - a.value)[0]?.value * 0.1).toFixed(1)} kg of CO₂e! 
                Check your Dashboard recommendations for quick actionable steps.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Analytics;
