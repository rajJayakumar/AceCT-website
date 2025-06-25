'use client'

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface ReviewNotesProps {
  subject: string;
  questionId: string;
}

const REASONS = [
  'content error',
  'misread the question',
  'test strategy error',
  'time pressure',
  'guessed',
];

export default function ReviewNotes({ subject, questionId }: ReviewNotesProps) {
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
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="card-title mb-3">Why did I get this question wrong?</h5>
        <div className="mb-3">
          {REASONS.map((reason) => (
            <div className="form-check" key={reason}>
              <input
                className="form-check-input"
                type="radio"
                name="wrongReason"
                id={reason}
                value={reason}
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
              />
              <label className="form-check-label" htmlFor={reason}>
                {reason.charAt(0).toUpperCase() + reason.slice(1)}
              </label>
            </div>
          ))}
        </div>
        <div className="mb-3">
          <label htmlFor="wrongNotes" className="form-label">
            Notes (optional):
          </label>
          <textarea
            className="form-control"
            id="wrongNotes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about your mistake..."
          />
        </div>
        {showSave && (
          <button
            className="btn btn-success"
            onClick={handleSave}
            disabled={isSaving || !selectedReason}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        )}
        {!showSave && savedReason && (
          <div className="alert alert-info mt-3 mb-0 p-2">
            <strong>Saved:</strong> {savedReason}
            {savedNotes && <span className="ms-2">- {savedNotes}</span>}
          </div>
        )}
      </div>
    </div>
  );
} 