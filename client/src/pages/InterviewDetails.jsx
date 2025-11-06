// client/src/pages/InterviewDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  IoIosArrowBack,
  IoMdBookmark,
  IoMdCalendar,
  IoMdCash,
  IoIosCheckmarkCircleOutline,
} from "react-icons/io";
import api from "../api/axiosInstance";

export default function InterviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    date: "",
    package: "",
    status: "Pending",
    topics: [],
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // -------------------- LOAD INTERVIEW --------------------
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/interviews/${id}`);
        if (!mounted) return;
        const data = res.data;
        setInterview(data);
        setForm({
          company: data.company || "",
          role: data.role || "",
          date: data.date
            ? new Date(data.date).toISOString().slice(0, 10)
            : "",
          package: data.package || "",
          status: data.status || "Pending",
          topics: Array.isArray(data.topics)
            ? data.topics.join(", ")
            : "",
          notes: data.notes || "",
        });
      } catch (err) {
        console.error("load interview", err);
        setError(err?.response?.data?.message || "Failed to load interview");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  // -------------------- RESET FORM --------------------
  function resetForm() {
    if (!interview) return;
    setForm({
      company: interview.company || "",
      role: interview.role || "",
      date: interview.date
        ? new Date(interview.date).toISOString().slice(0, 10)
        : "",
      package: interview.package || "",
      status: interview.status || "Pending",
      topics: Array.isArray(interview.topics)
        ? interview.topics.join(", ")
        : "",
      notes: interview.notes || "",
    });
  }

  // -------------------- DELETE INTERVIEW --------------------
  async function handleDelete() {
    if (!confirm("Delete this interview? This action cannot be undone.")) return;
    try {
      await api.delete(`/interviews/${id}`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("delete failed", err);
      setError(err?.response?.data?.message || "Failed to delete");
    }
  }

  // -------------------- HANDLE FORM --------------------
  function onFieldChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        company: form.company,
        role: form.role,
        date: form.date ? new Date(form.date).toISOString() : null,
        package: form.package,
        status: form.status,
        topics:
          typeof form.topics === "string"
            ? form.topics
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : form.topics,
        notes: form.notes,
      };
      const res = await api.put(`/interviews/${id}`, payload);
      setInterview(res.data);
      setEditing(false);
    } catch (err) {
      console.error("save error", err);
      setError(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="p-6 text-gray-400 bg-gray-900 min-h-screen">
        Loading interview...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-red-400 bg-gray-900 min-h-screen">{error}</div>
    );
  if (!interview)
    return (
      <div className="p-6 text-gray-400 bg-gray-900 min-h-screen">
        Interview not found.
      </div>
    );

  // -------------------- HELPER COMPONENTS --------------------
  const TopicPill = ({ children }) => (
    <span className="text-sm px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition duration-150 cursor-pointer border border-gray-700 font-medium">
      {children}
    </span>
  );

  const MainActionButton = ({ children, gradient }) => (
    <button
      className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition duration-200 shadow-lg ${
        gradient
          ? "bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"
          : "bg-gray-800 hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );

  const CompanyLogo = ({ companyName }) => {
    const name = (companyName || "").trim();
    const initial = name.charAt(0).toUpperCase();

    const getLogoStyle = (company) => {
      const lower = company.toLowerCase();
      if (lower.includes("google"))
        return { bg: "bg-white", text: "text-gray-800" };
      if (lower.includes("microsoft"))
        return { bg: "bg-blue-600", text: "text-white" };
      if (lower.includes("amazon"))
        return { bg: "bg-yellow-500", text: "text-gray-900" };
      if (lower.includes("figma"))
        return { bg: "bg-purple-600", text: "text-white" };
      return { bg: "bg-gray-700", text: "text-gray-200" };
    };

    const { bg, text } = getLogoStyle(name);

    return (
      <div
        className={`w-16 h-16 ${bg} rounded-xl flex items-center justify-center shadow-lg`}
      >
        <span className={`text-3xl font-bold ${text}`}>{initial}</span>
      </div>
    );
  };

  const EditInterviewForm = () => (
    <form
      onSubmit={handleSave}
      className="p-6 bg-gray-800 rounded-xl shadow-2xl sticky top-20 border border-gray-700"
    >
      <h3 className="text-xl font-semibold mb-4 text-pink-500">
        Edit Interview Details
      </h3>
      {error && (
        <div className="text-sm text-red-400 bg-red-900/30 p-2 rounded-lg mb-4">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        <label className="text-sm text-gray-300 block">
          Company
          <input
            name="company"
            value={form.company}
            onChange={onFieldChange}
            className="mt-1 p-3 rounded-lg bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500 w-full"
            required
          />
        </label>

        <label className="text-sm text-gray-300 block">
          Role
          <input
            name="role"
            value={form.role}
            onChange={onFieldChange}
            className="mt-1 p-3 rounded-lg bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500 w-full"
            required
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-sm text-gray-300 block">
            Date
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={onFieldChange}
              className="mt-1 p-3 rounded-lg bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500 w-full"
            />
          </label>
          <label className="text-sm text-gray-300 block">
            Package
            <input
              name="package"
              value={form.package}
              onChange={onFieldChange}
              className="mt-1 p-3 rounded-lg bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500 w-full"
            />
          </label>
        </div>

        <label className="text-sm text-gray-300 block">
          Status
          <select
            name="status"
            value={form.status}
            onChange={onFieldChange}
            className="mt-1 p-3 rounded-lg bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500 w-full"
          >
            <option>Pending</option>
            <option>Passed</option>
            <option>Failed</option>
          </select>
        </label>

        <label className="text-sm text-gray-300 block">
          Topics (comma separated)
          <input
            name="topics"
            value={form.topics}
            onChange={onFieldChange}
            className="mt-1 p-3 rounded-lg bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500 w-full"
          />
        </label>

        <label className="text-sm text-gray-300 block">
          Notes
          <textarea
            name="notes"
            value={form.notes}
            onChange={onFieldChange}
            rows={4}
            className="mt-1 p-3 rounded-lg bg-gray-700 text-white focus:ring-pink-500 focus:border-pink-500 w-full"
          />
        </label>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold transition duration-200 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="py-3 px-4 rounded-xl text-gray-400 hover:text-white transition duration-200 border border-gray-700 hover:border-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 px-4 rounded-xl text-red-400 hover:text-red-500 transition duration-200 border border-gray-700 hover:border-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </form>
  );

  // -------------------- RENDER --------------------
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between sticky top-0 bg-gray-900 z-20 border-b border-gray-800/50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full text-2xl text-gray-300 hover:bg-gray-800"
        >
          <IoIosArrowBack />
        </button>
        <h1 className="text-xl font-semibold">Interview Details</h1>
        <div className="flex items-center space-x-4">
          <IoMdBookmark className="text-2xl text-gray-400 cursor-pointer hover:text-pink-500" />
          <button
            onClick={() => {
              resetForm();
              setEditing((s) => !s);
            }}
            className={`py-2 px-4 rounded-full text-sm font-medium transition duration-150 ${
              editing
                ? "bg-red-500/10 text-red-400 border border-red-500/50"
                : "text-pink-400 hover:bg-gray-800 border border-pink-500/50 hidden md:block"
            }`}
          >
            {editing ? "Close Edit" : "Edit Interview"}
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-screen-xl mx-auto p-4 md:p-8 grid md:grid-cols-3 gap-8">
        {/* LEFT SECTION */}
        <div className="md:col-span-2">
          {/* JOB CARD */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <CompanyLogo companyName={interview.company} />
              <div>
                <h2 className="text-3xl font-bold">{interview.company}</h2>
                <p className="text-xl text-gray-400">{interview.role}</p>
              </div>
            </div>

            <div className="space-y-3 text-gray-300 text-base mb-8 max-w-sm">
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl">
                <IoMdCalendar className="text-pink-500 text-xl" />
                <span>
                  Date:{" "}
                  {new Date(interview.date).toLocaleDateString("en-US", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl">
                <IoMdCash className="text-pink-500 text-xl" />
                <span>Package: {interview.package || "$180,000"}</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-xl">
                <IoIosCheckmarkCircleOutline className="text-green-500 text-xl" />
                <span>PAQ Available</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3 mb-10 max-w-sm">
            <button
              onClick={() => navigate(`/mock-interview/${id}`)}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition duration-200 shadow-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90"
            >
              Start Full Mock
            </button>

            <Link to="/practice" className="block">
              <MainActionButton>Practice Rounds</MainActionButton>
            </Link>

            <button
              onClick={() => navigate(`/interview-notes/${id}`)}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg transition duration-200 shadow-lg bg-gray-800 hover:bg-gray-700"
            >
              Add Note
            </button>
          </div>

          {/* TOPICS */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-4">Topics required</h3>
            <div className="flex flex-wrap gap-3">
              {["Data Structures", "Algorithms", "System Design", "Behavioral"].map(
                (topic) => (
                  <TopicPill key={topic}>{topic}</TopicPill>
                )
              )}
            </div>
          </div>

          {/* QUESTIONS */}
          <div className="mb-10">
            <h3 className="text-xl font-semibold mb-3">Past questions</h3>
            <ul className="list-none space-y-3 text-gray-300">
              <li className="flex items-start before:content-['•'] before:text-pink-500 before:mr-2">
                Reverse a linked list.
              </li>
              <li className="flex items-start before:content-['•'] before:text-pink-500 before:mr-2">
                Find the median of two sorted arrays.
              </li>
              <li className="flex items-start before:content-['•'] before:text-pink-500 before:mr-2">
                Design a URL shortening service.
              </li>
            </ul>
          </div>

          {/* TIPS */}
          <div className="pb-12">
            <h3 className="text-xl font-semibold mb-3">Candidate tips</h3>
            <ul className="list-none space-y-3 text-gray-300">
              <li className="flex items-start before:content-['•'] before:text-pink-500 before:mr-2">
                Clearly explain your thought process.
              </li>
              <li className="flex items-start before:content-['•'] before:text-pink-500 before:mr-2">
                Discuss trade-offs for different solutions.
              </li>
              <li className="flex items-start before:content-['•'] before:text-pink-500 before:mr-2">
                Prepare stories for behavioral questions using the STAR method.
              </li>
            </ul>
          </div>

          {/* MOBILE EDIT BUTTON */}
          {!editing && (
            <div className="flex justify-center p-4 md:hidden">
              <button
                onClick={() => {
                  resetForm();
                  setEditing(true);
                }}
                className="py-2 px-6 rounded-full text-sm text-pink-400 hover:bg-gray-800 transition duration-150 border border-pink-500/50"
              >
                Edit Interview
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div
          className={`md:col-span-1 ${
            editing ? "block" : "hidden md:block"
          }`}
        >
          {editing && <EditInterviewForm />}
        </div>
      </div>
    </div>
  );
}
