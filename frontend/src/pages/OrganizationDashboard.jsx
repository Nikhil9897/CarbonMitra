import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Building2, Users, Calendar, Award, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const OrganizationDashboard = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [emissions, setEmissions] = useState(0.0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrgData = async () => {
      if (!user?.organizationId) return;
      try {
        const [membersRes, emissionsRes] = await Promise.all([
          api.get('/api/organization/members'),
          api.get(`/api/analytics/organization/${user.organizationId}`)
        ]);

        if (membersRes.data.success) setMembers(membersRes.data.data);
        if (emissionsRes.data.success) setEmissions(emissionsRes.data.data);
      } catch (err) {
        toast.error('Failed to load organization dashboard details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrgData();
  }, [user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user?.organizationId?.toString() || '');
    setCopied(true);
    toast.success('Organization join ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user?.organizationId) {
    return (
      <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-8 rounded-3xl text-center">
        <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="font-semibold text-slate-500">Not Associated with any Organization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Organization Portal</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage members and carbon analytics for <span className="font-bold text-slate-700 dark:text-slate-200">{user.organizationName}</span>.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">30-Day Org Emissions</p>
            <h3 className="text-2xl font-extrabold mt-1">{emissions} <span className="text-sm font-normal text-slate-400">kg CO₂e</span></h3>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Total Members</p>
            <h3 className="text-2xl font-extrabold mt-1">{members.length} <span className="text-sm font-normal text-slate-400">users</span></h3>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Organization ID</p>
              <h3 className="text-xl font-extrabold mt-1">{user.organizationId}</h3>
            </div>
          </div>
          <button 
            onClick={copyToClipboard}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-dark-800 dark:hover:bg-dark-700 text-slate-500 dark:text-slate-300 transition"
            title="Copy ID to Invite Members"
          >
            {copied ? <Check size={18} className="text-primary-500" /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      {/* Member List Grid */}
      <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-6 rounded-3xl">
        <h2 className="text-xl font-extrabold mb-6 flex items-center space-x-2">
          <Users size={20} className="text-primary-500" />
          <span>Affiliated Members</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-800 text-xs text-slate-400 uppercase font-bold">
                  <th className="pb-3 font-semibold">Username</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Provider</th>
                  <th className="pb-3 font-semibold text-right">System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800 text-sm">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/20 transition">
                    <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {member.username} {member.id === user.id && <span className="text-xs text-primary-500 font-normal">(You)</span>}
                    </td>
                    <td className="py-3.5 text-slate-500 dark:text-slate-400">{member.email}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-xs">
                        {member.provider}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${member.role === 'ROLE_ORGANIZATION_ADMIN' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'}
                      `}>
                        {member.role?.replace('ROLE_', '')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400 text-center py-6">No members registered yet under this organization.</p>
        )}
      </div>
    </div>
  );
};

export default OrganizationDashboard;
