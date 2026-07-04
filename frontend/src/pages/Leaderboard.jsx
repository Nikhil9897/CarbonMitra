import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trophy, Award, Search, Info } from 'lucide-react';
import { toast } from 'react-toastify';

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Community Leaderboard</h1>
          <p className="text-slate-500 dark:text-slate-400">See how your environmental impact compares to other community members. Top 50 Users with lowest footprints.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community users..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Information Alert */}
      <div className="p-4 bg-slate-50 dark:bg-dark-900/50 border border-slate-100 dark:border-dark-800 rounded-2xl flex items-start space-x-3 text-xs text-slate-500 dark:text-slate-400">
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
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-800 text-xs text-slate-400 uppercase font-bold bg-slate-50/50 dark:bg-dark-900/50">
                  <th className="py-4 px-6 font-semibold w-24">Rank</th>
                  <th className="py-4 px-6 font-semibold">User</th>
                  <th className="py-4 px-6 font-semibold text-center w-40">Badges Earned</th>
                  <th className="py-4 px-6 font-semibold text-right w-48">Total Footprint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-sm">
                {filteredLeaderboard.map((item) => {
                  const isTop3 = item.rank <= 3;
                  return (
                    <tr key={item.userId} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition">
                      <td className="py-4 px-6">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                          ${item.rank === 1 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 
                            item.rank === 2 ? 'bg-slate-200 text-slate-600 dark:bg-dark-800 dark:text-slate-300' : 
                            item.rank === 3 ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' : 
                            'text-slate-400'}
                        `}>
                          {isTop3 ? <Trophy size={14} /> : item.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.username}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 font-bold text-xs">
                          <Award size={12} />
                          <span>{item.badgesCount} Badges</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right font-extrabold text-slate-900 dark:text-slate-100 text-base">
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
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-16 rounded-3xl text-center text-slate-400">
          <Trophy size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-500">No users match search query</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
