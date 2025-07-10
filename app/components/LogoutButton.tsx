'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfileDropdown() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get display name/email from user object
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open profile menu"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.25a.25.25 0 01-.25.25h-14.5a.25.25 0 01-.25-.25v-.25z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 animate-fade-in">
          {user ? (
            <>
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="font-semibold text-gray-800 truncate">{displayName}</div>
                <div className="text-sm text-gray-500 truncate">{email}</div>
              </div>
              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded-b-lg"
                onClick={handleLogout}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition rounded-lg"
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </div>
  );
} 