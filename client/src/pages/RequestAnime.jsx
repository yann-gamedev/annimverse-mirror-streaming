import React, { useState, useEffect } from 'react';
import { requestAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle } from 'lucide-react';

const RequestAnime = () => {
  const { user, isAuthenticated } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [form, setForm] = useState({ title: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await requestAPI.getAll();
      setRequests(res.data || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setIsSubmitting(true);
    try {
      await requestAPI.create(form);
      setForm({ title: '', reason: '' });
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Failed to submit request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id, type) => {
    if (!isAuthenticated) return;
    try {
      await requestAPI.vote(id, type); // type = 'up' or 'down'
      fetchRequests(); // Refresh
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-400/10 text-green-400 border-green-400/20';
      case 'rejected': return 'bg-red-400/10 text-red-400 border-red-400/20';
      default: return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20';
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Col: Form */}
      <div className="md:col-span-1 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Request Anime</h1>
          <p className="text-sm text-gray-400">Can't find what you're looking for? Let us know!</p>
        </div>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="bg-[#0f0f11] p-5 rounded-xl border border-white/5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Anime Title</label>
              <input 
                type="text" 
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#8b5cf6] focus:outline-none"
                placeholder="Exact title preferred"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Reason (Optional)</label>
              <textarea 
                value={form.reason}
                onChange={e => setForm({...form, reason: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white focus:border-[#8b5cf6] focus:outline-none min-h-[100px]"
                placeholder="Why should we add this?"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <PlusCircle className="w-5 h-5" />
              Submit Request
            </button>
          </form>
        ) : (
          <div className="bg-[#0f0f11] p-6 rounded-xl border border-white/5 text-center">
            <p className="text-gray-400 mb-4">You must be logged in to submit a request.</p>
            <a href="/login" className="inline-block px-6 py-2 bg-[#8b5cf6] text-white rounded-lg font-medium">Log In</a>
          </div>
        )}
      </div>

      {/* Right Col: List */}
      <div className="md:col-span-2 space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Recent Requests</h2>
        
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">Loading requests...</div>
        ) : requests.length > 0 ? (
          requests.map(req => (
            <div key={req._id} className="bg-[#0f0f11] p-5 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-semibold text-white">{req.title}</h3>
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1 ${getStatusColor(req.status)}`}>
                    {getStatusIcon(req.status)}
                    <span className="capitalize">{req.status || 'pending'}</span>
                  </span>
                </div>
                {req.reason && <p className="text-sm text-gray-400 mt-1 line-clamp-2">{req.reason}</p>}
                <div className="text-xs text-gray-500 mt-2">
                  Requested by <span className="text-gray-300">{req.user?.username || 'Unknown'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/40 rounded-lg p-1 border border-white/5">
                <button 
                  onClick={() => handleVote(req._id, 'up')}
                  disabled={!isAuthenticated}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-green-400 transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{req.upvotes || 0}</span>
                </button>
                <div className="w-px h-6 bg-white/10"></div>
                <button 
                  onClick={() => handleVote(req._id, 'down')}
                  disabled={!isAuthenticated}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="text-sm font-medium">{req.downvotes || 0}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#0f0f11] p-8 rounded-xl border border-white/5 text-center text-gray-400">
            No requests found. Be the first to request an anime!
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestAnime;
