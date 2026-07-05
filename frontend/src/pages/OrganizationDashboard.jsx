import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Building2, Users, Calendar, Award, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import BackButton from '../components/BackButton';

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
      <div className="bg-white border border-borderEco p-8 rounded-3xl text-center shadow-sm">
        <Building2 size={32} className="mx-auto text-slate-350 mb-2" />
        <p className="font-extrabold text-slate-500">Not Associated with any Organization</p>
      </div>
    );
  }

  return (
    <>
      <BackButton />
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">Organization Portal</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Manage members and carbon analytics for <span className="font-bold text-slate-800">{user.organizationName}</span>.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-borderEco p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl border border-primary-100">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">30-Day Org Emissions</p>
              <h3 className="text-2xl font-extrabold mt-1 text-slate-800">{emissions} <span className="text-xs font-normal text-slate-400">kg CO₂e</span></h3>
            </div>
          </div>

          <div className="bg-white border border-borderEco p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Members</p>
              <h3 className="text-2xl font-extrabold mt-1 text-slate-800">{members.length} <span className="text-xs font-normal text-slate-400">users</span></h3>
            </div>
          </div>

          <div className="bg-white border border-borderEco p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Organization ID</p>
                <h3 className="text-xl font-extrabold mt-1 text-slate-850">{user.organizationId}</h3>
              </div>
            </div>
            <button 
              onClick={copyToClipboard}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 transition"
              title="Copy ID to Invite Members"
            >
              {copied ? <Check size={18} className="text-primary-500" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Member List Grid */}
        <div className="bg-white border border-borderEco p-6 rounded-3xl shadow-sm">
          <h2 className="text-xl font-extrabold mb-6 flex items-center space-x-2 text-slate-850">
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
                  <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase font-bold bg-slate-50/50">
                    <th className="py-3 px-4 font-semibold">Username</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Provider</th>
                    <th className="py-3 px-4 font-semibold text-right">System Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-emerald-50/10 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {member.username} {member.id === user.id && <span className="text-xs text-primary-500 font-normal">(You)</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">{member.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-100 text-xs font-bold text-slate-650">
                          {member.provider}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                          ${member.role === 'ROLE_ORGANIZATION_ADMIN' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}
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
            <p className="text-slate-400 text-center py-6 font-semibold">No members registered yet under this organization.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default OrganizationDashboard;
