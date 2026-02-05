// client/src/pages/Practice.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { HiOutlineSparkles, HiOutlineCog, HiOutlineHandRaised } from "react-icons/hi2";

/** format seconds -> MM:SS */
function formatSeconds(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * Practice page:
 * - If no ?category=... query param -> show round cards (Aptitude/Technical/HR)
 * - If category present -> load questions for category/difficulty/limit and run test
 */
export default function Practice() {
  const location = useLocation();
  const navigate = useNavigate();

  // parse params (category,difficulty,limit)
  const qp = new URLSearchParams(location.search);
  const paramCategory = qp.get("category"); // e.g. 'Aptitude' or null
  const paramDifficulty = qp.get("difficulty") || "Medium";
  const paramLimit = qp.get("limit") ? Number(qp.get("limit")) : 20;

  // state used for both modes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // states for running test (only used when category param present)
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedIndex }
  const [submitting, setSubmitting] = useState(false);

  // timer refs/state
  const startRef = useRef(null);
  const intervalRef = useRef(null);
  const runningRef = useRef(false);
  const [elapsed, setElapsed] = useState(0); // seconds

  // server-provided result after submit (not required)
  const [result, setResult] = useState(null);
  const [serverCorrectMap, setServerCorrectMap] = useState(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // If category param exists, auto-load questions
  useEffect(() => {
    // If no category param, we don't load questions (we're in round-selection view).
    if (!paramCategory) return;

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(
  `/api/practice/questions?category=${encodeURIComponent(paramCategory)}&difficulty=${encodeURIComponent(
    paramDifficulty
  )}&limit=${paramLimit}`
);

        if (!mounted) return;
        const qs = (res.data || []).map((q) => ({ ...q, _id: String(q._id) }));
        setQuestions(qs);
        setAnswers({});
        setCurrent(0);
        setResult(null);
        setServerCorrectMap(null);

        // start timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        startRef.current = Date.now();
        runningRef.current = true;
        setElapsed(0);
        intervalRef.current = setInterval(() => {
          if (!runningRef.current || !startRef.current) return;
          const diff = Math.floor((Date.now() - startRef.current) / 1000);
          setElapsed(diff);
        }, 500);
      } catch (err) {
        console.error("Failed to load questions", err);
        setError("Failed to load questions. Try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // reload when query params change

  // -----------------------
  // Round selection UI (when no category param)
  // -----------------------
  if (!paramCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#04060b] to-[#05060a] text-white py-12">
        <Container>
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold">Practice Rounds</h1>
            <p className="mt-2 text-gray-400">Choose a round to start your practice session.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Aptitude */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-700 to-sky-500 flex items-center justify-center text-white">
                  <HiOutlineSparkles size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">Aptitude Round</div>
                  <div className="text-sm text-gray-400 mt-2">Quantitative, Logical Reasoning, Basic Verbal.</div>

                  <div className="mt-4 flex items-center gap-2">
                    {["Easy", "Medium", "Hard"].map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          navigate(`/practice?category=Aptitude&difficulty=${encodeURIComponent(d)}&limit=20`)
                        }
                        className="px-3 py-1 rounded-full text-sm bg-black/30 text-gray-300"
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/practice?category=Aptitude&difficulty=Medium&limit=20`)}
                    >
                      Start Practice
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/practice/customize")}>
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Technical */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-700 to-indigo-600 flex items-center justify-center text-white">
                  <HiOutlineCog size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">Technical Round</div>
                  <div className="text-sm text-gray-400 mt-2">DSA, Algorithms, System Design basics.</div>

                  <div className="mt-4 flex items-center gap-2">
                    {["Easy", "Medium", "Hard"].map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          navigate(`/practice?category=Technical&difficulty=${encodeURIComponent(d)}&limit=10`)
                        }
                        className="px-3 py-1 rounded-full text-sm bg-black/30 text-gray-300"
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Button variant="primary" onClick={() => navigate(`/practice?category=Technical&difficulty=Medium&limit=10`)}>
                      Start Practice
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/technical/customize")}>
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* HR */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-500 flex items-center justify-center text-white">
                  <HiOutlineHandRaised size={20} />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">HR Round</div>
                  <div className="text-sm text-gray-400 mt-2">Behavioral, Situational, Resume-based questions.</div>

                  <div className="mt-4 flex items-center gap-2">
                    {["Easy", "Medium", "Hard"].map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          navigate(`/practice?category=HR&difficulty=${encodeURIComponent(d)}&limit=10`)
                        }
                        className="px-3 py-1 rounded-full text-sm bg-black/30 text-gray-300"
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Button variant="primary" onClick={() => navigate(`/practice?category=HR&difficulty=Medium&limit=10`)}>
                      Start Practice
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/hr/customize")}>
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {error && <div className="mt-6 text-red-400">{error}</div>}
        </Container>
      </div>
    );
  }

  // -----------------------
  // If we reach here: paramCategory exists -> show question runner
  // -----------------------
  if (loading) return <div className="p-6">Loading questions...</div>;
  if (!questions || questions.length === 0) return <div className="p-6">No questions available for this round.</div>;

  const q = questions[current];
  const qid = String(q._id);
  const selected = answers[qid];

  function selectOption(qidLocal, index) {
    setAnswers((prev) => ({ ...prev, [qidLocal]: index }));
  }

  function goPrev() {
    setCurrent((c) => Math.max(0, c - 1));
  }
  function goNext() {
    setCurrent((c) => Math.min(questions.length - 1, c + 1));
  }

  // stop timer and return final seconds
  function stopTimer() {
    runningRef.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startRef.current) {
      const final = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(final);
      return final;
    }
    return elapsed;
  }

  // handle submit similar to previous code
  async function handleSubmit() {
    setError("");

    // Build answers array expected by server
    const payloadAnswers = questions.map((qq) => {
      const id = String(qq._id);
      const sel = typeof answers[id] === "number" ? Number(answers[id]) : null;
      return { questionId: id, selectedIndex: sel };
    });

    const answeredCount = payloadAnswers.filter((a) => a.selectedIndex !== null).length;
    if (answeredCount === 0) {
      if (!window.confirm("You have not answered any questions. Submit anyway?")) return;
    }

    // stop timer and format
    const finalSecs = stopTimer();
    const timeTaken = formatSeconds(finalSecs);

    const payload = {
      category: paramCategory,
      difficulty: paramDifficulty,
      answers: payloadAnswers,
      timeTaken
    };

    setSubmitting(true);
    try {
     const res = await api.post("api/practice/submit", payload);

      setResult(res.data.result || null);
      setServerCorrectMap(res.data.correctAnswers || {});
      // After successful submit, navigate to results page (keeps results component working)
      navigate("/results");
    } catch (err) {
      console.error("submit failed", err);
      setError(err?.response?.data?.message || "Submit failed. Try again.");
      // if we want to resume after failure, restart timer from where it left
      const final = finalSecs || elapsed;
      startRef.current = Date.now() - final * 1000;
      runningRef.current = true;
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          if (!runningRef.current || !startRef.current) return;
          const diff = Math.floor((Date.now() - startRef.current) / 1000);
          setElapsed(diff);
        }, 500);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // UI for running test
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{paramCategory} Practice</h2>
        <div className="text-sm text-gray-300">Time elapsed: <strong>{formatSeconds(elapsed)}</strong></div>
      </div>

      <div className="mb-4">
        <p className="font-medium">{`Q${current + 1}: ${q.text}`}</p>
        <ul className="mt-3 space-y-2">
          {Array.isArray(q.options) && q.options.map((opt, i) => (
            <li key={i}>
              <button
                onClick={() => selectOption(qid, i)}
                className={`block w-full text-left px-3 py-2 rounded transition ${answers[qid] === i ? 'bg-indigo-600 text-white' : 'bg-white/10'}`}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-between mt-6 items-center">
        <div className="flex gap-2">
          <button
            disabled={current === 0}
            onClick={goPrev}
            className="px-3 py-2 rounded bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>

          {current < questions.length - 1 ? (
            <button onClick={goNext} className="px-3 py-2 rounded bg-indigo-600">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 rounded bg-green-600 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>

        <div className="text-sm text-gray-300">
          Answered: {Object.values(answers).filter((v) => typeof v === 'number').length} / {questions.length}
        </div>
      </div>

      {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
    </div>
  );
}
