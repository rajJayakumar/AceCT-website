'use client'

import { useState } from 'react';
import { uploadQuestionsToFirestore } from '../utils/uploadQuestionsToFirestore';

interface BaseQuestion {
    question: string
    choices: {
        A: string
        B: string
        C: string
        D: string
    }
    correct_answer: 'A' | 'B' | 'C' | 'D'
    explanation: string
    standard: string
    difficulty: 'easy' | 'medium' | 'hard'
}

interface BasePassage {
    type: 'prose fiction' | 'social science' | 'humanities' | 'natural science' | 'data representation' | 'research summaries' | 'conflicting viewpoints'
    passage: string
}

interface PassageQuestion {
    passage: BasePassage
    questions: BaseQuestion[]
}

interface FormattedQuestion extends BaseQuestion {
    id: number
    passageID?: number //not for math questions
}

interface FormattedPassage extends BasePassage{
    id: number
    questionIDs: number[]
}

const SUBJECTS = [
  { value: 'math', label: 'Math' },
  { value: 'reading', label: 'Reading' },
  { value: 'english', label: 'English' },
  { value: 'science', label: 'Science' },
];

export default function AdminPage() {
  const [subject, setSubject] = useState('math');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccess(false);
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setError(null);
    setSuccess(false);
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setLoading(true);
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        setError('Invalid JSON file.');
        setLoading(false);
        return;
      }
      // For math: accept BaseQuestion or BaseQuestion[]
      // For others: accept PassageQuestion or PassageQuestion[]
      await uploadQuestionsToFirestore(subject, parsed);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin: Upload Questions</h1>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Subject</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          >
            {SUBJECTS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Upload JSON File</label>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? 'Uploading questions to Firestore...' : 'Upload'}
        </button>
        {success && (
          <div className="mt-4 text-green-600 text-center font-semibold">Questions uploaded!</div>
        )}
        {error && (
          <div className="mt-4 text-red-600 text-center font-semibold">{error}</div>
        )}
      </div>
    </div>
  );
} 