"use client"
import React, { useState } from "react";
import { useAuthRedirect } from '../hooks/useAuthRedirect';

const SUBJECTS = ["math", "reading", "english", "science"];

export default function AdminPage() {
  useAuthRedirect();
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setJsonText("");
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject }),
      });
      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      setJsonText(JSON.stringify(data.questions, null, 2));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const questions = JSON.parse(jsonText);
      const res = await fetch("/api/upload-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, questions }),
      });
      if (!res.ok) {
        console.log(res.json())
        throw new Error("Failed to upload questions");
      }
      setSuccess("Questions uploaded to Firestore!");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold mb-2">Admin: Generate ACT Questions</h1>
        <div>
          <label className="block font-semibold mb-1">Select Subject</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          >
            <option value="">-- Select --</option>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <button
          className="bg-blue-600 text-white font-semibold rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          onClick={handleGenerate}
          disabled={!subject || loading}
        >
          {loading ? "Generating..." : "Generate Questions"}
        </button>
        <div>
          <label className="block font-semibold mb-1">Questions JSON</label>
          <textarea
            className="w-full min-h-[200px] border rounded px-3 py-2 font-mono text-sm"
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          className="bg-green-600 text-white font-semibold rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50"
          onClick={handleUpload}
          disabled={!jsonText || !subject || loading}
        >
          {loading ? "Uploading..." : "Upload to Firestore"}
        </button>
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        {success && <div className="text-green-600 font-semibold">{success}</div>}
      </div>
    </div>
  );
} 