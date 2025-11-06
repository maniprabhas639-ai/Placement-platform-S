// client/src/pages/Results.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function PercentBar({ pct = 0, color = 'green' }) {
  const bg = color === 'red' ? 'bg-red-500' : 'bg-green-400';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-white/5 h-3 rounded overflow-hidden">
        <div className={`${bg} h-3`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
      <div className="w-12 text-right text-sm font-semibold">{pct}%</div>
    </div>
  );
}

export default function Results() {
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('analysis'); // 'analysis' or 'solutions'

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/api/practice/results');

        if (!mounted) return;
        const arr = Array.isArray(res.data) ? res.data : [];
        arr.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        setResults(arr);
        setSelected(arr[0] || null);
      } catch (err) {
        console.error('Failed to load results', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="p-6 text-gray-300">Loading results...</div>;
  if (!selected) return (
    <Container className="py-8">
      <h2 className="text-2xl font-semibold mb-4">Your Practice Results</h2>
      <Card className="p-6">No results yet — take a practice test to generate a report.</Card>
    </Container>
  );

  const topicResults = Array.isArray(selected.topicResults) ? selected.topicResults : [];
  const strengths = [...topicResults].sort((a,b) => b.pct - a.pct).slice(0,3);
  const weaknesses = [...topicResults].sort((a,b) => a.pct - b.pct).slice(0,3);

  const total = selected.total || 0;
  const correct = selected.correctAnswers || 0;
  const wrong = (typeof selected.wrongAnswers === 'number') ? selected.wrongAnswers : Math.max(0, total - correct);
  const scorePercent = selected.score ?? (total>0 ? Math.round((correct/total)*100) : 0);
  const maxPoints = 200;
  const numericScore = Math.round((scorePercent/100) * maxPoints);
  const correctMap = selected.correctAnswersMap ? Object.fromEntries(Object.entries(selected.correctAnswersMap || {})) : {};
  const snapshot = Array.isArray(selected.questionsSnapshot) ? selected.questionsSnapshot : [];
  const timeTaken = selected.timeTaken || '';

  // Print handler: prints the page (browser print dialog)
  function handlePrint() {
    window.print();
  }

  // Back handler: go back in history; fallback to dashboard
  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  }

  // Open YouTube search for suggested videos. We base query off selected.category and a couple keywords.
  function openSuggestedVideos() {
    // Build a helpful search query depending on category
    const cat = (selected.category || '').toLowerCase();
    let q = 'programming tutorials';
    if (cat.includes('aptitude')) q = 'permutations probability practice tutorial';
    else if (cat.includes('coding') || cat.includes('technical')) q = 'data structures and algorithms tutorial';
    else if (cat.includes('hr')) q = 'interview behavioural questions tips';
    // open new tab
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`, '_blank');
  }

  // Navigate to practice page (weak topics -> general practice). You may refine query params if your Practice page supports them.
  function goToPractice() {
    navigate('/practice');
  }

  // Navigate to a practice step; pass query params so PracticeHub/Practice can read them.
  function startPracticeStep({ category = 'Aptitude', difficulty = 'Medium', limit = 15 }) {
    // Example path: /practice?category=Aptitude&difficulty=Medium&limit=15
    const params = new URLSearchParams({ category, difficulty, limit: String(limit) }).toString();
    navigate(`/practice?${params}`);
  }

  return (
    <div className="min-h-screen py-8">
      <Container>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Test Results: {selected.category}</h1>
            <p className="text-gray-400 mt-2">Here's a detailed breakdown of your performance.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="text-sm text-gray-300">Back</button>
            <Button variant="primary" onClick={handlePrint}>Print</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Card className="p-6 flex items-center gap-6">
              <div style={{ minWidth: 140 }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: `conic-gradient(#3ee1a5 ${scorePercent*3.6}deg, rgba(255,255,255,0.06) ${scorePercent*3.6}deg)`,
                  display: 'grid', placeItems: 'center', boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
                }}>
                  <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', display: 'grid', placeItems: 'center' }}>
                    <div className="text-white font-bold">{Math.round(scorePercent)}%</div>
                    <div className="text-xs text-gray-400">Percentile</div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="text-sm text-gray-400">OVERALL SCORE</div>
                <div className="mt-2 flex items-baseline gap-3">
                  <div className="text-4xl font-extrabold">{numericScore}</div>
                  <div className="text-lg text-gray-300">/ {maxPoints}</div>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-semibold text-green-400">Excellent Work!</div>
                  <div className="text-sm text-gray-400">You're in the top tier of performers.</div>
                </div>
              </div>

              <div style={{ minWidth: 100 }}>
                <div className="text-sm text-gray-400 mb-2">Percentile</div>
                <div className="rounded-full bg-[#0b1220] w-20 h-20 grid place-items-center">
                  <div className="text-white font-bold">{Math.round(scorePercent)}%</div>
                  <div className="text-xs text-gray-400">Percentile</div>
                </div>
              </div>
            </Card>

            <div className="mt-6">
              <div className="flex items-center gap-6 border-b border-gray-800 pb-3 mb-6">
                <button onClick={() => setTab('analysis')} className={`text-sm font-semibold pb-2 ${tab==='analysis' ? 'border-b-2 border-blue-500' : 'text-gray-400'}`}>Analysis</button>
                <button onClick={() => setTab('solutions')} className={`text-sm ${tab==='solutions' ? 'font-semibold border-b-2 border-blue-500 pb-2' : 'text-gray-400'}`}>Solutions</button>
              </div>

              {tab === 'analysis' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-5">
                      <h3 className="text-lg font-semibold mb-3">Your Strengths</h3>
                      <div className="space-y-4">
                        {strengths.length ? strengths.map(s => (
                          <div key={s.name} className="flex items-center justify-between">
                            <div className="text-sm">{s.name}</div>
                            <div style={{ width: '60%' }}>
                              <PercentBar pct={s.pct} />
                            </div>
                          </div>
                        )) : <div className="text-gray-400">No topic breakdown available.</div>}
                      </div>
                    </Card>

                    <Card className="p-5">
                      <h3 className="text-lg font-semibold mb-3">Recommended Learning Path</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-[#071017] p-3 rounded">
                          <div className="w-20 h-12 bg-gray-800 rounded" />
                          <div className="flex-1">
                            <div className="font-medium">Mastering Permutations</div>
                            <div className="text-sm text-gray-400">1h 45m</div>
                          </div>
                          <div>
                            <button className="px-3 py-1 rounded bg-white/5 text-sm" onClick={() => window.open('https://www.youtube.com/results?search_query=permutations+tutorial', '_blank')}>Watch</button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-[#071017] p-3 rounded">
                          <div className="w-20 h-12 bg-gray-800 rounded" />
                          <div className="flex-1">
                            <div className="font-medium">Introduction to Probability</div>
                            <div className="text-sm text-gray-400">2h 10m</div>
                          </div>
                          <div>
                            <button className="px-3 py-1 rounded bg-white/5 text-sm" onClick={() => window.open('https://www.youtube.com/results?search_query=probability+tutorial', '_blank')}>Watch</button>
                          </div>
                        </div>

                        <div className="mt-2">
                          <button className="px-4 py-2 rounded bg-gradient-to-r from-pink-500 to-violet-500 text-white" onClick={openSuggestedVideos}>Watch Suggested Videos</button>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card className="p-5">
                      <h3 className="text-lg font-semibold mb-3">Areas for Improvement</h3>
                      <div className="space-y-4">
                        {weaknesses.length ? weaknesses.map(w => (
                          <div key={w.name} className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="text-sm mb-1">{w.name}</div>
                              <div className="bg-white/5 rounded h-3 overflow-hidden">
                                <div style={{ width: `${w.pct}%` }} className="h-3 bg-red-500" />
                              </div>
                            </div>
                            <div className="w-12 text-right text-sm font-semibold">{w.pct}%</div>
                          </div>
                        )) : <div className="text-gray-400">No topic data available.</div>}
                      </div>

                      <div className="mt-4">
                        <button className="px-4 py-2 rounded bg-gradient-to-r from-pink-500 to-violet-500 text-white" onClick={goToPractice}>Practice Weak Topics</button>
                      </div>
                    </Card>

                    <Card className="p-5">
                      <h3 className="text-lg font-semibold mb-3">Next Practice Steps</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-[#071017] p-3 rounded">
                          <div>
                            <div className="font-medium">Topic Test: Permutations</div>
                            <div className="text-sm text-gray-400">15 Questions • 20 Mins</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs bg-yellow-800 text-yellow-200 px-2 py-1 rounded mr-2">MEDIUM</div>
                            <button className="px-3 py-1 rounded bg-white/5 text-sm" onClick={() => startPracticeStep({ category: 'Aptitude', difficulty: 'Medium', limit: 15 })}>Start</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-[#071017] p-3 rounded">
                          <div>
                            <div className="font-medium">Mixed Quiz: P&C, Probability</div>
                            <div className="text-sm text-gray-400">20 Questions • 30 Mins</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-xs bg-red-800 text-red-200 px-2 py-1 rounded mr-2">HARD</div>
                            <button className="px-3 py-1 rounded bg-white/5 text-sm" onClick={() => startPracticeStep({ category: 'Aptitude', difficulty: 'Hard', limit: 20 })}>Start</button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </>
              )}

              {tab === 'solutions' && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Solutions & Review</h3>

                  {snapshot.length === 0 ? (
                    <Card className="p-4">No question snapshots saved with this result.</Card>
                  ) : (
                    snapshot.map((q, idx) => {
                      const qid = String(q._id);

                      // attempt to find user's selection if it was saved on result
                      let userSelected = null;
                      if (selected.userAnswers && Array.isArray(selected.userAnswers)) {
                        const ua = selected.userAnswers.find(x => String(x.questionId) === qid);
                        if (ua) userSelected = ua.selectedIndex;
                      }

                      const correctIdx = typeof q.correctIndex === 'number' ? q.correctIndex : (selected.correctAnswersMap ? selected.correctAnswersMap[qid] : null);

                      return (
                        <Card key={qid} className="p-4 mb-3">
                          <div className="mb-2 font-medium">Q{idx + 1}: {q.text}</div>

                          {Array.isArray(q.options) && q.options.length > 0 ? (
                            q.options.map((opt, i) => {
                              const isCorrect = (typeof correctIdx === 'number' && Number(correctIdx) === i);
                              const isSelected = (typeof userSelected === 'number' && Number(userSelected) === i);
                              const bg = isCorrect ? 'bg-green-600/30' : (isSelected ? 'bg-red-600/20' : 'bg-white/5');
                              return (
                                <div key={i} className={`px-3 py-2 rounded mb-1 ${bg} flex items-center`}>
                                  <div className="w-6 text-sm mr-2">{isCorrect ? '✓' : (isSelected ? (isCorrect ? '✓' : '✗') : '•')}</div>
                                  <div>{opt}</div>
                                </div>
                              );
                            })
                          ) : <div className="text-sm text-gray-400">No options.</div>}

                          {q.explanation && <div className="mt-2 text-sm text-gray-300"><strong>Explanation:</strong> {q.explanation}</div>}
                        </Card>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="sticky top-20 space-y-4">
              <Card className="p-4">
                <div className="text-sm text-gray-400">Correct Answers</div>
                <div className="text-2xl font-bold text-green-400 mt-2">{correct}</div>
                <div className="text-xs text-gray-400 mt-1">{correct} / {total} correct</div>
              </Card>

              <Card className="p-4">
                <div className="text-sm text-gray-400">Incorrect Answers</div>
                <div className="text-2xl font-bold text-red-400 mt-2">{wrong}</div>
              </Card>

              <Card className="p-4">
                <div className="text-sm text-gray-400">Time Taken</div>
                <div className="text-2xl font-bold mt-2">{timeTaken || '—'}</div>
              </Card>

              <Card className="p-4">
                <div className="text-sm text-gray-400">Details</div>
                <div className="mt-2 text-sm text-white/80">
                  <div><strong>Category:</strong> {selected.category}</div>
                  <div><strong>Submitted:</strong> {new Date(selected.submittedAt).toLocaleString()}</div>
                  <div><strong>Difficulty:</strong> {selected.difficulty || '—'}</div>
                </div>
              </Card>

              {/* Internal Map removed per request */}
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}
