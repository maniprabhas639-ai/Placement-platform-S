// client/src/pages/MockInterview.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

export default function MockInterview() {
  const [stage, setStage] = useState('choose'); // choose | running | result | history
  const [type, setType] = useState('');
  const [interview, setInterview] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mocks, setMocks] = useState([]);

  async function startMock() {
    if (!type) return alert('Choose HR or Technical');
    setLoading(true);
    try {
      const res = await api.post('/api/mock/start', { type });
      setInterview(res.data);
      setResponses(new Array(res.data.questions.length).fill(''));
      setStage('running');
    } catch (err) {
      console.error('startMock', err);
      alert('Failed to start mock interview');
    } finally {
      setLoading(false);
    }
  }

  async function submitMock() {
    setLoading(true);
    try {
      await api.post('/api/mock/submit', { interviewId: interview._id, responses });
      alert('Mock submitted successfully!');
      setStage('result');
      loadHistory();
    } catch (err) {
      console.error('submitMock', err);
      alert('Submit failed');
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    try {
      const res = await api.get('/api/mock');
      setMocks(res.data);
    } catch (err) {
      console.error('loadHistory', err);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  if (stage === 'choose') {
    return (
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-semibold mb-4">Start a Mock Interview</h1>
        <div className="flex gap-4 mb-4">
          <button onClick={() => setType('HR')} className={`btn ${type==='HR'?'bg-indigo-600':''}`}>HR</button>
          <button onClick={() => setType('Technical')} className={`btn ${type==='Technical'?'bg-indigo-600':''}`}>Technical</button>
        </div>
        <button onClick={startMock} disabled={!type || loading} className="btn-primary px-4 py-2 rounded">
          {loading ? 'Starting...' : 'Start Interview'}
        </button>

        <h2 className="text-xl font-semibold mt-8 mb-2">Previous Mocks</h2>
        {mocks.length === 0 && <div className="text-sm text-gray-400">No past mocks yet.</div>}
        {mocks.map((m, i) => (
          <div key={m._id} className="card mb-2 p-3">
            <div className="font-medium">{m.type} — {new Date(m.submittedAt).toLocaleString()}</div>
            <div className="text-sm text-gray-400">Score: {m.score}% | {m.feedback}</div>
          </div>
        ))}
      </div>
    );
  }

  if (stage === 'running') {
    return (
      <div className="p-6 max-w-4xl">
        <h2 className="text-xl font-semibold mb-3">{type} Mock Interview</h2>
        {interview.questions.map((q, i) => (
          <div key={i} className="card mb-4">
            <div className="font-medium mb-2">Q{i+1}: {q}</div>
            <textarea
              className="w-full p-2 bg-white/5 rounded"
              rows={4}
              placeholder="Type your answer here..."
              value={responses[i]}
              onChange={e => {
                const newR = [...responses];
                newR[i] = e.target.value;
                setResponses(newR);
              }}
            />
          </div>
        ))}
        <button onClick={submitMock} disabled={loading} className="btn-primary px-4 py-2 rounded">
          {loading ? 'Submitting...' : 'Submit Interview'}
        </button>
      </div>
    );
  }

  if (stage === 'result') {
    return (
      <div className="p-6 max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Mock Interview Submitted</h2>
        <p className="text-gray-300 mb-4">
          Your responses were recorded and saved. You can view them below or start a new mock.
        </p>
        <button onClick={() => setStage('choose')} className="btn px-3 py-2 rounded">Back to Home</button>
      </div>
    );
  }

  return null;
}
