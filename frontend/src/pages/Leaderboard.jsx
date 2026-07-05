import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trophy, Award, Search, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/api/leaderboard');
        if (response.data.success) {
          setLeaderboard(response.data.data);
        }
      } catch (err) {
        toast.error('Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(item => 
    item.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <BackButton />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">Community Leaderboard</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">See how your environmental impact compares to other community members. Top 50 Users with lowest footprints.</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search community users..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-textEco"
            />
          </div>
        </div>

        {/* Information Alert */}
        <div className="p-4 bg-emerald-50/40 border border-borderEco rounded-2xl flex items-start space-x-3 text-xs text-slate-650 leading-relaxed font-semibold">
          <Info size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
          <p>
            To preserve privacy, other users' names are partially masked (GDPR Compliant). Leaderboard is sorted by lowest total carbon footprint. Keep logging green choices to move up the ranks!
          </p>
        </div>

        {/* Leaderboard Table List */}
        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredLeaderboard.length > 0 ? (
          <div className="bg-white border border-borderEco rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-450 uppercase font-bold bg-slate-50/55">
                    <th className="py-4 px-6 font-semibold w-24">Rank</th>
                    <th className="py-4 px-6 font-semibold">User</th>
                    <th className="py-4 px-6 font-semibold text-center w-40">Badges Earned</th>
                    <th className="py-4 px-6 font-semibold text-right w-48">Total Footprint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLeaderboard.map((item) => {
                    const isTop3 = item.rank <= 3;
                    return (
                      <tr key={item.userId} className="hover:bg-emerald-50/10 transition">
                        <td className="py-4 px-6">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                            ${item.rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                              item.rank === 2 ? 'bg-slate-100 text-slate-600 border border-slate-200' : 
                              item.rank === 3 ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                              'text-slate-400'}
                          `}>
                            {isTop3 ? <Trophy size={14} /> : item.rank}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-800">{item.username}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 font-bold text-xs border border-primary-100">
                            <Award size={12} />
                            <span>{item.badgesCount} Badges</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-extrabold text-slate-900 text-base">
                          {item.totalCo2e} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-borderEco p-16 rounded-3xl text-center text-slate-400 shadow-sm font-semibold">
            <Trophy size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-500">No users match search query</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Leaderboard;
