// client/src/pages/AdminSubmissions.jsx
import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function AdminSubmissions() {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ score: 0, status: '', correctAnswers: 0, wrongAnswers: 0, adminNotes: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (filter.status) q.set('status', filter.status);
        if (filter.category) q.set('category', filter.category);
        const res = await api.get(`/admin/submissions?${q.toString()}`);
        if (!mounted) return;
        setSubmissions(res.data || []);
      } catch (err) {
        console.error('load submissions', err);
        setMsg('Failed to load submissions');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [filter]);

  function startEdit(s) {
    setEditingId(s._id);
    setEditValues({
      score: s.score || 0,
      status: s.status || 'manual_review',
      correctAnswers: s.correctAnswers || 0,
      wrongAnswers: s.wrongAnswers || 0,
      adminNotes: s.adminNotes || ''
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValues({ score:0, status:'', correctAnswers:0, wrongAnswers:0, adminNotes:'' });
  }

  async function saveEdit(id) {
    try {
      const payload = {
        status: editValues.status,
        score: Number(editValues.score),
        correctAnswers: Number(editValues.correctAnswers),
        wrongAnswers: Number(editValues.wrongAnswers),
        adminNotes: editValues.adminNotes
      };
      const res = await api.put(`/admin/submissions/${id}`, payload);
      // update local state
      setSubmissions(prev => prev.map(p => p._id === id ? res.data : p));
      setMsg('Saved');
      setEditingId(null);
      setTimeout(()=>setMsg(''), 2000);
    } catch (err) {
      console.error('save edit failed', err);
      setMsg(err?.response?.data?.message || 'Failed to save');
    }
  }

  if (!user) return <div className="p-6">Loading user...</div>;
  if (user.role !== 'admin') return <div className="p-6 text-red-400">Admin access required to view this page.</div>;

  return (
    <div className="p-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Submissions Review</h1>
          <p className="text-sm text-gray-400">Review code submissions and update status/score.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter.status} onChange={(e)=>setFilter(f=>({...f, status: e.target.value}))} className="p-2 rounded bg-white/5">
            <option value="">All statuses</option>
            <option value="manual_review">Manual Review</option>
            <option value="pending">Pending</option>
            <option value="auto_pass">Auto Pass</option>
            <option value="auto_fail">Auto Fail</option>
          </select>
          <select value={filter.category} onChange={(e)=>setFilter(f=>({...f, category: e.target.value}))} className="p-2 rounded bg-white/5">
            <option value="">All categories</option>
            <option value="Coding">Coding</option>
            <option value="Aptitude">Aptitude</option>
            <option value="HR">HR</option>
          </select>
        </div>
      </header>

      {msg && <div className="mb-3 text-sm text-green-300">{msg}</div>}
      {loading && <div className="p-6">Loading submissions...</div>}

      <div className="grid gap-3">
        {submissions.map(s => (
          <div key={s._id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-400">{s.category} • {s.difficulty || '—'} • {new Date(s.submittedAt).toLocaleString()}</div>
                <div className="font-medium">{s.user?.name || s.user?.email} <span className="text-xs text-gray-400">({s.user?.email})</span></div>
                <div className="text-sm">Score: <strong>{s.score ?? '—'}</strong> • Status: <strong>{s.status}</strong></div>
              </div>
              <div className="flex gap-2">
                <Link to={s._id ? `/interview/${s._id}` : '#'} className="px-3 py-1 rounded btn-ghost">View</Link>
                <button onClick={() => startEdit(s)} className="px-3 py-1 rounded btn">Review</button>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xs text-gray-300 mb-2">Submitted code:</div>
              <pre className="bg-black/70 p-3 rounded text-xs overflow-auto" style={{maxHeight: 220, whiteSpace: 'pre-wrap'}}>{s.submissionCode || '(no code submitted)'}</pre>
            </div>

            {editingId === s._id && (
              <div className="mt-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <input className="p-2 rounded bg-white/5" value={editValues.score} onChange={(e)=>setEditValues(v=>({...v, score: e.target.value}))} placeholder="score (0-100)" />
                  <select className="p-2 rounded bg-white/5" value={editValues.status} onChange={(e)=>setEditValues(v=>({...v, status: e.target.value}))}>
                    <option value="manual_review">manual_review</option>
                    <option value="auto_pass">auto_pass</option>
                    <option value="auto_fail">auto_fail</option>
                    <option value="pending">pending</option>
                  </select>
                  <input className="p-2 rounded bg-white/5" value={editValues.correctAnswers} onChange={(e)=>setEditValues(v=>({...v, correctAnswers: e.target.value}))} placeholder="correctAnswers" />
                </div>

                <textarea rows={3} className="w-full p-2 rounded bg-white/5 mb-2" value={editValues.adminNotes} onChange={(e)=>setEditValues(v=>({...v, adminNotes: e.target.value}))} placeholder="Notes for this submission (optional)"></textarea>

                <div className="flex gap-2">
                  <button onClick={() => saveEdit(s._id)} className="px-3 py-1 rounded btn">Save</button>
                  <button onClick={cancelEdit} className="px-3 py-1 rounded btn-ghost">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
