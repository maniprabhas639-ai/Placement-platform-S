// client/src/pages/PracticeHub.jsx
import React, { useEffect, useRef, useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { HiOutlineSparkles, HiOutlineCog, HiOutlineHandRaised } from "react-icons/hi2";

/** Utility: format seconds -> "MM:SS" */
function formatSeconds(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function PracticeHub() {
  const navigate = useNavigate();

  const [stage, setStage] = useState("config");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [serverCorrectMap, setServerCorrectMap] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const intervalRef = useRef(null);
  const runningRef = useRef(false);

  // 🧠 Separate difficulty state per round
  const [difficultyByCategory, setDifficultyByCategory] = useState({
    Aptitude: "Medium",
    Technical: "Medium",
    HR: "Medium",
  });

  // Cleanup timer
  useEffect(() => {
    return () => {
      runningRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ✅ Start test
  async function startTest(selectedCategory, selectedDifficulty, selectedLimit = 10) {
    setError("");
    setLoading(true);
    try {
      const res = await api.get(
        `/practice/questions?category=${encodeURIComponent(selectedCategory)}&difficulty=${encodeURIComponent(
          selectedDifficulty
        )}&limit=${selectedLimit}`
      );

      const qs = (res.data || []).map((q) => ({ ...q, _id: String(q._id) }));
      setQuestions(qs);
      setAnswers({});
      setCurrent(0);

      // Start timer
      if (intervalRef.current) clearInterval(intervalRef.current);
      startRef.current = Date.now();
      runningRef.current = true;
      setElapsed(0);
      intervalRef.current = setInterval(() => {
        if (!runningRef.current || !startRef.current) return;
        const diff = Math.floor((Date.now() - startRef.current) / 1000);
        setElapsed(diff);
      }, 500);

      setStage("running");
    } catch (err) {
      console.error("Failed to load questions", err);
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  // Select difficulty per category
  function handleDifficultyChange(category, diff) {
    setDifficultyByCategory((prev) => ({ ...prev, [category]: diff }));
  }

  // Stop timer
  function stopTimer() {
    runningRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (startRef.current) {
      const final = Math.floor((Date.now() - startRef.current) / 1000);
      setElapsed(final);
      return final;
    }
    return elapsed;
  }

  async function handleSubmit() {
    setError("");
    if (!questions.length) return;

    const payloadAnswers = questions.map((q) => ({
      questionId: String(q._id),
      selectedIndex: typeof answers[q._id] === "number" ? Number(answers[q._id]) : null,
    }));

    const finalSecs = stopTimer();
    const payload = {
      category: questions[0]?.category || "Aptitude",
      difficulty: difficultyByCategory[questions[0]?.category || "Aptitude"],
      answers: payloadAnswers,
      timeTaken: formatSeconds(finalSecs),
    };

    setLoading(true);
    try {
      const res = await api.post("/practice/submit", payload);
      setResult(res.data.result);
      setServerCorrectMap(res.data.correctAnswers || {});
      setStage("result");
    } catch (err) {
      console.error("Submit failed", err);
      setError(err?.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStage("config");
    setQuestions([]);
    setAnswers({});
    setCurrent(0);
    setResult(null);
    setServerCorrectMap(null);
    setError("");
    runningRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    startRef.current = null;
    setElapsed(0);
  }

  // ---------------------------
  // CONFIG VIEW
  // ---------------------------
  if (stage === "config") {
    const rounds = [
      {
        key: "Aptitude",
        icon: <HiOutlineSparkles size={20} />,
        color: "from-sky-700 to-sky-500",
        desc: "Quantitative, Logical Reasoning, Basic Verbal.",
      },
      {
        key: "Technical",
        icon: <HiOutlineCog size={20} />,
        color: "from-violet-700 to-indigo-600",
        desc: "DSA, Algorithms, System Design basics.",
      },
      {
        key: "HR",
        icon: <HiOutlineHandRaised size={20} />,
        color: "from-emerald-700 to-emerald-500",
        desc: "Behavioral, Situational, Resume-based questions.",
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#04060b] to-[#05060a] text-white py-12">
        <Container>
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold">Practice Rounds</h1>
            <p className="mt-2 text-gray-400">Choose a round and difficulty to start your session.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rounds.map((round) => (
              <Card key={round.key} className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${round.color} flex items-center justify-center text-white`}
                  >
                    {round.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-semibold">{round.key} Round</div>
                    <div className="text-sm text-gray-400 mt-2">{round.desc}</div>

                    {/* Difficulty selector */}
                    <div className="mt-4 flex items-center gap-2">
                      {["Easy", "Medium", "Hard"].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => handleDifficultyChange(round.key, diff)}
                          className={`px-3 py-1 rounded-full text-sm transition ${
                            difficultyByCategory[round.key] === diff
                              ? "bg-white/20 text-white font-semibold"
                              : "bg-black/30 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>

                    {/* Start & Customize buttons */}
                    <div className="mt-6 flex items-center gap-3">
                      <Button
                        variant="primary"
                        onClick={() =>
                          startTest(round.key, difficultyByCategory[round.key], 10)
                        }
                      >
                        Start Practice
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(`/practice/customize/${round.key.toLowerCase()}`)}
                      >
                        Customize
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {error && <div className="mt-6 text-red-400">{error}</div>}
        </Container>
      </div>
    );
  }

  // ---------------------------
  // RUNNING VIEW
  // ---------------------------
  if (stage === "running") {
    if (!questions.length) return <div className="p-6">No questions found.</div>;
    const q = questions[current];
    const qid = String(q._id);
    const selected = answers[qid];

    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {q.category} Practice — {difficultyByCategory[q.category] || "Medium"}
            </h2>
            <p className="text-sm text-gray-400">
              {current + 1} / {questions.length}
            </p>
          </div>
          <div className="text-sm text-gray-300">
            Time: <strong>{formatSeconds(elapsed)}</strong>
          </div>
        </div>

        <div className="card mb-4">
          <div className="mb-3 font-medium">{q.text}</div>
          <div className="space-y-2">
            {Array.isArray(q.options) && q.options.length > 0 ? (
              q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [qid]: i }))}
                  className={`block w-full text-left px-3 py-2 rounded ${
                    selected === i ? "bg-indigo-600 text-white" : "bg-white/5"
                  }`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <div className="text-sm text-gray-400">No options for this question.</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="px-3 py-2 rounded btn-ghost"
            >
              Previous
            </button>
            {current < questions.length - 1 ? (
              <button
                onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                className="px-3 py-2 rounded btn"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Test"}
              </button>
            )}
          </div>
          <button onClick={restart} className="px-3 py-1 rounded btn-ghost">
            Cancel Test
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------
  // RESULT VIEW (unchanged)
  // ---------------------------
  if (stage === "result") {
    const grading = result
      ? {
          total: result.total,
          correctAnswers: result.correctAnswers,
          wrongAnswers: result.wrongAnswers,
          score: result.score,
        }
      : null;
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Test Result</h2>
          <p className="text-sm text-gray-400">
            Score: <strong>{grading ? grading.score : "—"}%</strong>
            {grading ? ` — ${grading.correctAnswers}/${grading.total} correct` : ""}
          </p>
        </div>

        <div className="mb-4">
          <button onClick={() => navigate("/report")} className="px-3 py-2 rounded btn">
            Go to Report
          </button>
          <button
            onClick={() => setStage("running")}
            className="px-3 py-2 ml-2 rounded btn-ghost"
          >
            Retry same test
          </button>
          <button onClick={restart} className="px-3 py-2 ml-2 rounded btn-ghost">
            Back to config
          </button>
        </div>
      </div>
    );
  }

  return null;
}
