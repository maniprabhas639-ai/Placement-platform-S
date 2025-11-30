import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

export default function Coding() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("// write your solution here");
  const [language, setLanguage] = useState("javascript");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load coding question
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
      const res = await api.get(
  "/practice/questions?category=Coding&difficulty=Medium&limit=1"
);

        if (!mounted) return;

        const q = Array.isArray(res.data) && res.data.length ? res.data[0] : null;
        setQuestion(q);

        const draftKey = q ? `coding-draft-${q._id}` : null;

        if (draftKey) {
          const draft = localStorage.getItem(draftKey);
          if (draft) setCode(draft);
        }
      } catch (err) {
        console.error("Load coding question failed", err);
        setMessage("Failed to load coding question");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Loading states
  if (loading) return <div className="p-6 text-white">Loading coding problem...</div>;
  if (!question)
    return <div className="p-6 text-white">No coding problems available.</div>;

  // Save draft locally
  const saveDraft = () => {
    try {
      localStorage.setItem(`coding-draft-${question._id}`, code);
      setMessage("Draft saved locally.");
      setTimeout(() => setMessage(""), 2500);
    } catch (e) {
      console.error("Save draft failed", e);
      setMessage("Failed to save draft");
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        category: "Coding",
        total: 1,
        correctAnswers: 0,
        difficulty: question.difficulty || "Medium",
        submissionCode: code,
        language,
        status: "manual_review",
      };

      await api.post("/practice/submit", payload);

      localStorage.removeItem(`coding-draft-${question._id}`);
      navigate("/results");
    } catch (err) {
      console.error("Submit failed", err);
      setMessage(err?.response?.data?.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#0f0f0f] text-white font-inter">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Coding Problem</h2>
          <p className="text-sm text-gray-400">
            {question.difficulty} • {question.category}
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-2 rounded bg-[#1e1e1e] border border-gray-700 text-white"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>

          <button
            onClick={saveDraft}
            className="px-4 py-2 rounded bg-[#222] hover:bg-[#333] transition"
          >
            Save Draft
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 transition"
          >
            {saving ? "Submitting..." : "Submit Code"}
          </button>
        </div>
      </div>

      {/* Question Display */}
      <div className="mb-4 p-4 rounded-xl bg-[#111] border border-gray-800">
        <h3 className="font-medium text-lg mb-2">{question.text}</h3>

        {question.options && question.options.length > 0 && (
          <div className="text-sm text-gray-300 mb-2">
            {question.options.map((o, idx) => (
              <div key={idx}>• {o}</div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          (You are submitting code for manual review — auto-judge not implemented.)
        </div>
      </div>

      {/* Code Editor */}
      <div
        style={{ height: 420 }}
        className="mb-4 rounded-xl overflow-hidden border border-gray-800"
      >
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(v) => setCode(v)}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
          }}
        />
      </div>

      {message && <div className="text-sm text-green-400 mb-2">{message}</div>}
    </div>
  );
}
