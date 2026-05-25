import React, { useState, useEffect } from 'react';
import { BarChart, Film, PlayCircle, Shield, Users, Save } from 'lucide-react';
import { adminAPI, animeAPI } from '../api/client';

const AdminDashboard = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-[#0f0f11] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10"><Users size={100} className="text-purple-500" /></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-gray-400 font-medium">Total Users</h3>
        <div className="p-2 bg-purple-500/20 rounded-lg"><Users className="text-purple-400" size={20} /></div>
      </div>
      <p className="text-4xl font-bold text-white relative z-10">{stats?.users || 0}</p>
    </div>
    
    <div className="bg-[#0f0f11] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10"><Film size={100} className="text-cyan-500" /></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-gray-400 font-medium">Total Anime</h3>
        <div className="p-2 bg-cyan-500/20 rounded-lg"><Film className="text-cyan-400" size={20} /></div>
      </div>
      <p className="text-4xl font-bold text-white relative z-10">{stats?.anime || 0}</p>
    </div>
    
    <div className="bg-[#0f0f11] p-6 rounded-2xl border border-gray-800 shadow-lg relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10"><PlayCircle size={100} className="text-pink-500" /></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="text-gray-400 font-medium">Total Episodes</h3>
        <div className="p-2 bg-pink-500/20 rounded-lg"><PlayCircle className="text-pink-400" size={20} /></div>
      </div>
      <p className="text-4xl font-bold text-white relative z-10">{stats?.episodes || 0}</p>
    </div>
  </div>
);

const AddAnimeForm = () => {
  const [formData, setFormData] = useState({ title: '', slug: '', synopsis: '', coverImage: '' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Add anime', formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-[#0f0f11] p-8 rounded-2xl border border-gray-800 space-y-6 max-w-2xl shadow-xl">
      <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Film className="text-purple-500" /> Add New Anime</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Title</label>
          <input type="text" className="w-full bg-[#050505] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Slug (URL friendly)</label>
          <input type="text" className="w-full bg-[#050505] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Cover Image URL</label>
          <input type="text" className="w-full bg-[#050505] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" value={formData.coverImage} onChange={e => setFormData({...formData, coverImage: e.target.value})} />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Synopsis</label>
          <textarea className="w-full bg-[#050505] border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-y" rows="4" value={formData.synopsis} onChange={e => setFormData({...formData, synopsis: e.target.value})}></textarea>
        </div>
      </div>
      
      <button type="submit" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/25">
        <Save size={18} /> Save Anime
      </button>
    </form>
  );
};

const AddEpisodeForm = () => {
  return (
    <div className="bg-[#0f0f11] p-8 rounded-2xl border border-gray-800 space-y-6 max-w-2xl shadow-xl">
       <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><PlayCircle className="text-cyan-500" /> Add New Episode</h3>
       <p className="text-gray-400">Episode addition interface would go here.</p>
    </div>
  );
};

const AddBadgeForm = () => {
  return (
    <div className="bg-[#0f0f11] p-8 rounded-2xl border border-gray-800 space-y-6 max-w-2xl shadow-xl">
       <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><Shield className="text-pink-500" /> Create Badge</h3>
       <p className="text-gray-400">Badge creation interface would go here.</p>
    </div>
  );
};

const ManageUsers = ({ users }) => {
  return (
    <div className="bg-[#0f0f11] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-gray-800/40 text-gray-300 text-sm tracking-wide">
              <th className="p-5 border-b border-gray-800 font-medium">Username</th>
              <th className="p-5 border-b border-gray-800 font-medium">Email</th>
              <th className="p-5 border-b border-gray-800 font-medium">Role</th>
              <th className="p-5 border-b border-gray-800 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="text-gray-300 border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                <td className="p-5 font-medium">{u.username}</td>
                <td className="p-5 text-gray-400">{u.email}</td>
                <td className="p-5">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                    u.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-lg transition-colors">
                    Toggle Role
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-3 opacity-50" />
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const statsRes = await adminAPI.getStats();
        setStats(statsRes.data);
      } catch (e) {
        console.error('Failed to fetch stats', e);
      }
    };
    if (activeTab === 'dashboard') {
      fetchAdminData();
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await adminAPI.getUsers();
        setUsers(usersRes.data || []);
      } catch (e) {
        console.error('Failed to fetch users', e);
      }
    };
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'anime', label: 'Add Anime', icon: Film },
    { id: 'episode', label: 'Add Episode', icon: PlayCircle },
    { id: 'badge', label: 'Add Badge', icon: Shield },
    { id: 'users', label: 'Manage Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-10 flex items-center gap-4">
          <div className="p-3 bg-purple-600/20 rounded-xl">
            <Shield className="text-purple-500" size={32} />
          </div>
          Admin Control Panel
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-[#0f0f11] rounded-2xl border border-gray-800 p-4 space-y-2 sticky top-24 shadow-xl">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white font-medium shadow-lg shadow-purple-500/25 border border-purple-500/50' 
                        : 'text-gray-400 hover:bg-gray-800/80 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'dashboard' && <AdminDashboard stats={stats} />}
            {activeTab === 'anime' && <AddAnimeForm />}
            {activeTab === 'episode' && <AddEpisodeForm />}
            {activeTab === 'badge' && <AddBadgeForm />}
            {activeTab === 'users' && <ManageUsers users={users} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
