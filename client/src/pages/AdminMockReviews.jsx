// client/src/pages/AdminMockReviews.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { Link } from 'react-router-dom';

export default function AdminMockReviews() {
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // selected mock object
  const [edit, setEdit] = useState({ score: '', feedback: '' });
  const [msg, setMsg] = useState('');

  async function loadList() {
    setLoading(true);
    try {
      const res = await api.get('/admin/mocks?limit=100');
      setMocks(res.data || []);
    } catch (err) {
      console.error('load mocks', err);
      setMsg('Failed to load mocks');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadList(); }, []);

  async function openMock(id) {
    try {
      const res = await api.get(`/admin/mocks/${id}`);
      setSelected(res.data);
      setEdit({ score: res.data.score ?? '', feedback: res.data.feedback ?? '' });
    } catch (err) {
      console.error('openMock', err);
      setMsg('Failed to load mock');
    }
  }

  async function saveReview() {
    if (!selected) return;
    const payload = {
      score: edit.score === '' ? undefined : Number(edit.score),
      feedback: edit.feedback
    };
    try {
      const res = await api.put(`/admin/mocks/${selected._id}`, payload);
      setSelected(res.data);
      setMsg('Saved');
      // update list locally
      setMocks(prev => prev.map(m => (m._id === res.data._id ? res.data : m)));
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      console.error('saveReview', err);
      setMsg(err?.response?.data?.message || 'Save failed');
    }
  }

  if (loading) return <div className="p-6">Loading mock interviews...</div>;

  return (
    <div className="p-6 max-w-5xl">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mock Interviews — Admin Review</h1>
          <p className="text-sm text-gray-400">Review user responses and provide feedback/score.</p>
        </div>
        <div>
          <button onClick={loadList} className="px-3 py-1 rounded btn-ghost">Refresh</button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <div className="mb-2 text-sm text-gray-400">Recent mocks</div>
          <div className="space-y-2">
            {mocks.map(m => (
              <div key={m._id} className="card p-3 cursor-pointer" onClick={() => openMock(m._id)}>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{m.type} • {m.user?.name || m.user?.email}</div>
                    <div className="text-xs text-gray-400">{new Date(m.submittedAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm font-semibold">{m.score ?? '—'}%</div>
                </div>
              </div>
            ))}
            {mocks.length === 0 && <div className="text-sm text-gray-400">No mock interviews found.</div>}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selected && (
            <div className="card p-4">
              <div className="text-sm text-gray-400">Select a mock interview from the left to view responses and leave feedback.</div>
            </div>
          )}

          {selected && (
            <div className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-medium">{selected.user?.name || selected.user?.email} — {selected.type}</div>
                  <div className="text-xs text-gray-400">{new Date(selected.submittedAt).toLocaleString()}</div>
                </div>
                <div className="text-sm">Score: <strong>{selected.score ?? '—'}%</strong></div>
              </div>

              <div className="mb-3">
                <h3 className="font-semibold mb-2">Responses</h3>
                {selected.questions.map((q, i) => (
                  <div key={i} className="mb-3">
                    <div className="text-sm font-medium">Q{i+1}: {q}</div>
                    <pre className="bg-black/70 p-3 rounded text-sm whitespace-pre-wrap mt-1">{selected.responses?.[i] ?? '(no response)'}</pre>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <label className="text-sm block mb-1">Score (%)</label>
                <input
                  type="number"
                  value={edit.score}
                  onChange={(e) => setEdit(v => ({ ...v, score: e.target.value }))}
                  className="p-2 rounded bg-white/5"
                  min={0}
                  max={100}
                />
              </div>

              <div className="mb-3">
                <label className="text-sm block mb-1">Feedback / Notes</label>
                <textarea value={edit.feedback} onChange={(e) => setEdit(v => ({ ...v, feedback: e.target.value }))} rows={4} className="w-full p-2 rounded bg-white/5" />
              </div>

              <div className="flex gap-2">
                <button onClick={saveReview} className="px-3 py-1 rounded btn">Save Review</button>
                <button onClick={() => { setSelected(null); setEdit({ score: '', feedback: '' }); }} className="px-3 py-1 rounded btn-ghost">Close</button>
                <Link to="/admin/submissions" className="px-3 py-1 rounded btn-ghost">Go to Code Submissions</Link>
              </div>

              {msg && <div className="text-sm text-green-300 mt-2">{msg}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
