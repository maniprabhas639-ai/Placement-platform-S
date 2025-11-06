// client/src/components/InterviewCard.jsx
import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function InterviewCard({ interview, onDelete = () => {} }) {
  const dateStr = interview.date ? format(new Date(interview.date), 'MMM dd, yyyy') : 'TBA';
  const statusColor = {
    Passed: 'bg-green-500/20 text-green-300',
    Failed: 'bg-red-500/20 text-red-300',
    Pending: 'bg-yellow-500/10 text-yellow-300'
  }[interview.status] || 'bg-gray-700 text-gray-200';

  return (
    <div className="card flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium">{interview.company}</h3>
            <p className="text-sm text-gray-400">{interview.role}</p>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>{interview.status}</div>
        </div>

        <div className="mt-4 text-sm text-gray-300">
          <div><span className="text-gray-400">Date: </span>{dateStr}</div>
          {interview.package && <div><span className="text-gray-400">Package: </span>{interview.package}</div>}
          {interview.topics && interview.topics.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {interview.topics.map(t => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-white/5">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link to={`/interview/${interview._id}`} className="px-3 py-1 rounded btn">View</Link>
        <button
          onClick={() => {
            if (confirm('Delete this interview?')) onDelete(interview._id);
          }}
          className="px-3 py-1 rounded btn-ghost"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
