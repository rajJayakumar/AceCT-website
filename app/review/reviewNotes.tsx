'use client'

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface ReviewNotesProps {
  subject: string;
  questionId: number;
  onReviewNotesFilled?: (filled: boolean) => void;
}

const REASONS = [
  'content error',
  'misread the question',
  'test strategy error',
  'time pressure',
  'guessed',
];

export default function ReviewNotes({ subject, questionId, onReviewNotesFilled }: ReviewNotesProps) {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState('');
  const [notes, setNotes] = useState('');
  const [savedReason, setSavedReason] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSave, setShowSave] = useState(false);

  // Load existing notes from Firestore
  useEffect(() => {
    const fetchNotes = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const old = userData?.questions?.[subject]?.old?.[questionId];
      if (old) {
        setSelectedReason(old.wrongReason || '');
        setNotes(old.wrongNotes || '');
        setSavedReason(old.wrongReason || '');
        setSavedNotes(old.wrongNotes || '');
      }
    };
    fetchNotes();
  }, [user, subject, questionId]);

  // Show save button if there are unsaved changes
  useEffect(() => {
    if (
      (selectedReason && selectedReason !== savedReason) ||
      notes !== savedNotes
    ) {
      setShowSave(true);
    } else {
      setShowSave(false);
    }
  }, [selectedReason, notes, savedReason, savedNotes]);

  // Notify parent if review notes are filled
  useEffect(() => {
    if (onReviewNotesFilled) {
      onReviewNotesFilled(!!selectedReason);
    }
  }, [selectedReason, onReviewNotesFilled]);

  useEffect(() => {
    if (onReviewNotesFilled) {
      onReviewNotesFilled(!!selectedReason);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`questions.${subject}.old.${questionId}.wrongReason`]: selectedReason,
        [`questions.${subject}.old.${questionId}.wrongNotes`]: notes,
      });
      setSavedReason(selectedReason);
      setSavedNotes(notes);
      setShowSave(false);
    } catch (error) {
      console.error('Error saving review notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-6 w-full">
      <h5 className="text-lg font-semibold mb-3">Question Analysis</h5>
      {
        /* Dropdown for wrong reason */
      }
      <div className="flex flex-col gap-2">
        <label htmlFor="wrongReason" className="text-gray-700 font-medium">
          Reason for wrong answer
        </label>
        <select
          id="wrongReason"
          name="wrongReason"
          value={selectedReason}
          onChange={e => setSelectedReason(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow focus:border-gray-500 focus:outline-none text-gray-700 mb-2"
        >
          <option value="" disabled>
            Select a reason
          </option>
          {REASONS.map((reason) => (
            <option value={reason} key={reason}>
              {reason.charAt(0).toUpperCase() + reason.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label htmlFor="wrongNotes" className="block text-gray-700 font-medium mb-1">
          Notes:
        </label>
        <textarea
          className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white min-h-[48px]"
          id="wrongNotes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about your mistake..."
        />
      </div>
      {showSave && (
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={handleSave}
          disabled={isSaving || !selectedReason}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      )}
      {/* {!showSave && savedReason && (
        <div className="bg-blue-50 text-blue-800 rounded-lg px-3 py-2 mt-3 text-sm">
          <strong>Saved:</strong> {savedReason}
          {savedNotes && <span className="ml-2">- {savedNotes}</span>}
        </div>
      )} */}
    </div>
  );
} 