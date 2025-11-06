// client/src/components/InterviewForm.jsx
import React, { useState } from 'react';
import api from '../api/axiosInstance';

/**
 * props:
 * - onCreate(interview)  -> called after interview is created on server
 * - onClose()             -> close the form/modal
 */
export default function InterviewForm({ onCreate = () => {}, onClose = () => {} }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [pkg, setPkg] = useState('');
  const [status, setStatus] = useState('Pending');
  const [topicsStr, setTopicsStr] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function validate() {
    if (!company.trim()) return 'Company is required';
    if (!role.trim()) return 'Role is required';
    if (!date) return 'Date is required';
    // optional: ensure date parseable
    const d = Date.parse(date);
    if (Number.isNaN(d)) return 'Invalid date';
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    // Build payload
    const payload = {
      company: company.trim(),
      role: role.trim(),
      date: new Date(date).toISOString(),
      package: pkg.trim(),
      status,
      notes: notes.trim(),
      topics: topicsStr.split(',').map(t => t.trim()).filter(Boolean)
    };

    setLoading(true);
    try {
      // POST to server
      const res = await api.post('/interviews', payload);
      // server returns created interview
      const created = res.data;
      onCreate(created); // optimistic UI handled by parent
      // clear form (optionally)
      setCompany('');
      setRole('');
      setDate('');
      setPkg('');
      setStatus('Pending');
      setTopicsStr('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error('Create interview failed', err);
      setError(err?.response?.data?.message || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-black/40 p-4 rounded">
      {error && <div className="text-sm text-red-400">{error}</div>}

      <div>
        <label className="block text-sm text-gray-300">Company *</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="mt-1 w-full p-2 rounded bg-white/5"
          placeholder="e.g. Google"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300">Role *</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 w-full p-2 rounded bg-white/5"
          placeholder="e.g. SDE 1"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-300">Date *</label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
            className="mt-1 w-full p-2 rounded bg-white/5"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300">Package (optional)</label>
          <input
            value={pkg}
            onChange={(e) => setPkg(e.target.value)}
            placeholder="$120,000 or 12 LPA"
            className="mt-1 w-full p-2 rounded bg-white/5"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300">Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full p-2 rounded bg-white/5">
          <option>Pending</option>
          <option>Passed</option>
          <option>Failed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-300">Topics (comma separated)</label>
        <input
          value={topicsStr}
          onChange={(e) => setTopicsStr(e.target.value)}
          placeholder="Data Structures, Algorithms"
          className="mt-1 w-full p-2 rounded bg-white/5"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows="3"
          className="mt-1 w-full p-2 rounded bg-white/5"
          placeholder="Optional notes for this interview"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-gradient-to-r from-pink-400 to-violet-400 disabled:opacity-60"
        >
          {loading ? 'Saving...' : 'Add Interview'}
        </button>
        <button type="button" onClick={onClose} className="px-3 py-2 rounded border border-white/10">
          Cancel
        </button>
      </div>
    </form>
  );
}
