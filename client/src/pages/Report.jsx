// client/src/pages/Report.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

// --- Utility Function: Calculate Percentile ---
const calculatePercentile = (score) => {
  if (score >= 95) return 98;
  if (score >= 85) return 90 + Math.floor((score - 85) / 2);
  if (score >= 70) return 70 + Math.floor((score - 70) * 1.5);
  if (score < 50) return 40;
  return Math.floor(score * 0.8);
};

// --- Icon Components ---
const PlayCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="10 8 16 12 10 16 10 8"></polygon>
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const BoltIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#4ADE80"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 10V3L4 14H11V21L20 10H13Z"></path>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#FBBF24"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

// --- UI Components ---

function CircularProgress({ percent, score, percentile }) {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const clippedPercent = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clippedPercent / 100) * circumference;
  const scoreText = `${score}/100`;
  const percentileText = percentile
    ? `You are in the ${percentile}th Percentile`
    : 'Overall Performance';

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-xl font-bold text-white mb-1">{scoreText}</div>
      <div className="text-sm text-gray-400 mb-4">{percentileText}</div>

      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#262626"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>

        <svg width="0" height="0">
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: 'rgb(255, 100, 150)', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: 'rgb(150, 100, 255)', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{clippedPercent}%</span>
        </div>
      </div>

      <p className="mt-4 text-gray-300 font-medium">
        Great work! Here's your breakdown.
      </p>
    </div>
  );
}

function CategoryBar({ name, value, isWeakness = false }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const colorClasses = isWeakness
    ? 'from-yellow-500 to-orange-500'
    : 'from-green-400 to-green-600';

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <div className="font-medium text-gray-200">{name}</div>
      </div>
      <div className="w-full bg-white/10 rounded h-3">
        <div
          style={{ width: `${pct}%` }}
          className={`h-3 rounded bg-gradient-to-r ${colorClasses}`}
        />
      </div>
    </div>
  );
}

export default function Report() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/api/report');

        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        console.error('Failed to load report', e);
        if (mounted) setErr('Failed to load report');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return <div className="p-6 text-white bg-gray-900 min-h-screen">Loading report...</div>;
  if (err)
    return <div className="p-6 text-red-400 bg-gray-900 min-h-screen">{err}</div>;
  if (!data)
    return <div className="p-6 text-white bg-gray-900 min-h-screen">No data yet.</div>;

  // --- Dynamic Data Processing ---
  const { avgScore = 0, categories = [] } = data;
  const calculatedPercentile = calculatePercentile(avgScore);
  const STRENGTH_THRESHOLD = 80;

  const strengths = categories.filter((c) => c.avgScore >= STRENGTH_THRESHOLD);
  const weaknesses = categories.filter((c) => c.avgScore < STRENGTH_THRESHOLD);

  const suggestedVideos = [
    {
      title: 'Mastering System Design',
      duration: '1h 45m',
      link: 'http://www.youtube.com/watch?v=L9TfZdODuFQ',
      thumbnail: 'code-image',
    },
    { title: 'SQL Deep Dive', duration: '2h 10m', link: '#', thumbnail: 'sql-image' },
  ];

  const suggestedPractice = [
    { title: 'System Design Mock Interview', link: '/practice/system-design' },
    { title: 'Database Query Challenge', link: '/practice/database-query' },
  ];

  const handlePracticeWeakTopics = () => {
    navigate('/practice');
  };

  const handleVideoClick = (videoTitle, videoUrl) => {
    if (videoUrl && videoUrl !== '#') {
      window.location.href = videoUrl;
    } else {
      alert(`Simulating video play for: ${videoTitle}`);
    }
  };

  const CARD_CLASS = 'bg-gray-800 p-4 rounded-xl shadow-lg text-white';
  const BUTTON_CLASS = 'py-3 w-full rounded-xl text-lg font-semibold transition-colors';

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Header Bar */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-700/50 p-4 text-center z-10">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
          aria-label="Go back"
        >
          <BackArrowIcon />
        </button>
        <h1 className="text-xl font-semibold">Performance Report</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-0">
        {/* 1. Overall Score Section */}
        <section className="text-center py-6">
          <CircularProgress
            percent={Math.round(avgScore) || 0}
            score={Math.round(avgScore) || 0}
            percentile={calculatedPercentile}
          />
        </section>

        {/* 2. Strengths Section */}
        <section className={`mb-6 ${CARD_CLASS}`}>
          <h2 className="flex items-center text-lg font-semibold mb-4 text-green-400">
            <BoltIcon />
            <span className="ml-2">Strengths</span>
          </h2>
          <div className="space-y-3">
            {strengths.length === 0 && (
              <p className="text-sm text-gray-400">
                No high-scoring topics found (Score &lt; {STRENGTH_THRESHOLD}%).
              </p>
            )}
            {strengths.map((c) => (
              <CategoryBar key={c.category} name={c.category} value={c.avgScore} />
            ))}
          </div>
        </section>

        {/* 3. Weaknesses Section */}
        <section className={`mb-6 ${CARD_CLASS}`}>
          <h2 className="flex items-center text-lg font-semibold mb-4 text-yellow-400">
            <AlertTriangleIcon />
            <span className="ml-2">Weaknesses (Low Score Topics)</span>
          </h2>
          <div className="space-y-3">
            {weaknesses.length === 0 && (
              <p className="text-sm text-gray-400">
                No weaknesses defined (Score ≥ {STRENGTH_THRESHOLD}% in all).
              </p>
            )}
            {weaknesses.map((c) => (
              <CategoryBar
                key={c.category}
                name={c.category}
                value={c.avgScore}
                isWeakness
              />
            ))}
          </div>
        </section>

        {/* 4. Suggested Videos Section */}
        <section className="mb-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-white">
            <BriefcaseIcon />
            <span className="ml-2">Suggested Topics & Course Videos</span>
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {suggestedVideos.map((video, index) => (
              <div
                key={index}
                onClick={() => handleVideoClick(video.title, video.link)}
                className="flex-shrink-0 w-48 rounded-xl overflow-hidden shadow-xl bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="relative h-28 w-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center flex items-center justify-center text-white/50 text-xs p-2"
                    style={{
                      backgroundColor:
                        video.thumbnail === 'sql-image' ? '#1f2937' : '#374151',
                    }}
                  >
                    <pre className="text-xs text-white/80 select-none">
                      {video.thumbnail === 'code-image'
                        ? `@app.route("/api")
def handler():
    # check auth
    if not auth:
        return 401
    soft_run_query()
    return 200`
                        : `SELECT *
FROM USERS
WHERE SCORE > 90`}
                    </pre>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <PlayCircleIcon className="w-10 h-10 text-white/80" />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium mt-0 leading-snug">
                    {video.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{video.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Suggested Practice Rounds */}
        <section className="mb-8">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-white">
            <BriefcaseIcon />
            <span className="ml-2">Suggested Practice Rounds</span>
          </h2>
          <div className="space-y-2">
            {suggestedPractice.map((practice, index) => (
              <a
                key={index}
                href={practice.link}
                className={`flex justify-between items-center ${CARD_CLASS} hover:bg-gray-700 transition-colors cursor-pointer !p-4`}
              >
                <div className="flex items-center">
                  <BriefcaseIcon
                    className="w-5 h-5 mr-3"
                    style={{ stroke: '#C084FC' }}
                  />
                  <span className="font-medium">{practice.title}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 6. Action Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gray-900 z-0">
          <div className="max-w-xl mx-auto space-y-3">
            <button
              onClick={handlePracticeWeakTopics}
              className={`${BUTTON_CLASS} bg-pink-600 hover:bg-pink-700`}
            >
              Practice Weak Topics
            </button>
            <button
              className={`${BUTTON_CLASS} bg-gray-700 hover:bg-gray-600 border border-gray-600`}
            >
              Watch Suggested Videos
            </button>
          </div>
        </div>

        <div className="h-40" aria-hidden="true"></div>
      </div>
    </div>
  );
}
