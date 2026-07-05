import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Users, Building2, Flame, Trash2, Edit3, Save, X } from 'lucide-react';
import BackButton from '../components/BackButton';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Editing states for Factors
  const [editingFactor, setEditingFactor] = useState(null);
  const [factorVal, setFactorVal] = useState('');
  const [factorSource, setFactorSource] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await api.get('/api/admin/users');
        if (res.data.success) setUsers(res.data.data);
      } else if (activeTab === 'orgs') {
        const res = await api.get('/api/admin/organizations');
        if (res.data.success) setOrganizations(res.data.data);
      } else if (activeTab === 'factors') {
        const res = await api.get('/api/admin/emission-factors');
        if (res.data.success) setFactors(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load admin panel details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await api.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        toast.success('User deleted successfully');
        loadData();
      }
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleEditFactor = (factor) => {
    setEditingFactor(factor);
    setFactorVal(factor.kgCo2ePerUnit);
    setFactorSource(factor.source);
  };

  const handleSaveFactor = async () => {
    if (!editingFactor) return;
    try {
      const payload = {
        kgCo2ePerUnit: parseFloat(factorVal),
        source: factorSource,
        effectiveDate: editingFactor.effectiveDate
      };
      const res = await api.put(`/api/admin/emission-factors/${editingFactor.id}`, payload);
      if (res.data.success) {
        toast.success('Emission factor updated successfully');
        setEditingFactor(null);
        loadData();
      }
    } catch (err) {
      toast.error('Failed to update factor');
    }
  };

  return (
    <>
      <BackButton />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">Admin Console</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage user authorization, review corporate organizations, and update dynamic CO₂ conversion factors.</p>
        </div>

        {/* Tabs list header */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 flex items-center space-x-2 transition ${activeTab === 'users' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500'}`}
          >
            <Users size={16} />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('orgs')}
            className={`pb-3 flex items-center space-x-2 transition ${activeTab === 'orgs' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500'}`}
          >
            <Building2 size={16} />
            <span>Organizations</span>
          </button>
          <button
            onClick={() => setActiveTab('factors')}
            className={`pb-3 flex items-center space-x-2 transition ${activeTab === 'factors' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500'}`}
          >
            <Flame size={16} />
            <span>Emission Factors</span>
          </button>
        </div>

        {/* Tab Panels */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="bg-white border border-borderEco rounded-3xl overflow-hidden shadow-sm">
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-xs text-slate-400 uppercase font-bold bg-slate-50/50">
                      <th className="py-4 px-6 font-semibold">User</th>
                      <th className="py-4 px-6 font-semibold">Email</th>
                      <th className="py-4 px-6 font-semibold">Role</th>
                      <th className="py-4 px-6 font-semibold">Provider</th>
                      <th className="py-4 px-6 font-semibold text-center w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-emerald-50/10 transition">
                        <td className="py-3.5 px-6 font-bold text-slate-800">{u.username}</td>
                        <td className="py-3.5 px-6 text-slate-500 font-semibold">{u.email}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 text-slate-600">
                            {u.role.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500 font-semibold">{u.provider}</td>
                        <td className="py-3.5 px-6 text-center">
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'orgs' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-xs text-slate-400 uppercase font-bold bg-slate-50/50">
                      <th className="py-4 px-6 font-semibold w-24">ID</th>
                      <th className="py-4 px-6 font-semibold">Organization Name</th>
                      <th className="py-4 px-6 font-semibold">Admin Username</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {organizations.map(o => (
                      <tr key={o.id} className="hover:bg-emerald-50/10 transition">
                        <td className="py-4 px-6 font-extrabold text-slate-400">{o.id}</td>
                        <td className="py-4 px-6 font-bold text-slate-800">{o.name}</td>
                        <td className="py-4 px-6 text-slate-500 font-semibold">{o.adminUser?.username || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'factors' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 text-xs text-slate-400 uppercase font-bold bg-slate-50/50">
                      <th className="py-4 px-6 font-semibold">Activity</th>
                      <th className="py-4 px-6 font-semibold">Unit</th>
                      <th className="py-4 px-6 font-semibold">kg CO₂e per unit</th>
                      <th className="py-4 px-6 font-semibold">Source</th>
                      <th className="py-4 px-6 font-semibold text-center w-24">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {factors.map(f => (
                      <tr key={f.id} className="hover:bg-emerald-50/10 transition">
                        <td className="py-3.5 px-6 font-bold text-slate-800">{f.activityType.replaceAll('_', ' ')}</td>
                        <td className="py-3.5 px-6 text-slate-400 font-semibold">{f.unit}</td>
                        <td className="py-3.5 px-6 font-extrabold text-slate-900">{f.kgCo2ePerUnit}</td>
                        <td className="py-3.5 px-6 text-slate-500 font-semibold">{f.source}</td>
                        <td className="py-3.5 px-6 text-center">
                          <button
                            onClick={() => handleEditFactor(f)}
                            className="text-slate-400 hover:text-primary-500 p-1.5 rounded-lg transition"
                            title="Edit Factor"
                          >
                            <Edit3 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Edit inline Modal */}
        {editingFactor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white border border-borderEco rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">
                  Edit {editingFactor.activityType.replaceAll('_', ' ')}
                </h3>
                <button onClick={() => setEditingFactor(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    kg CO₂e per {editingFactor.unit}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={factorVal}
                    onChange={(e) => setFactorVal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-bgEco border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-textEco"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Source Citation
                  </label>
                  <input
                    type="text"
                    value={factorSource}
                    onChange={(e) => setFactorSource(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-bgEco border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-textEco"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={() => setEditingFactor(null)}
                    className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-500 py-2.5 rounded-xl text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveFactor}
                    className="w-1/2 bg-gradient-to-r from-primary-600 to-secondary-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] flex items-center justify-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save Factor</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
