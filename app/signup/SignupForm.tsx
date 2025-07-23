'use client'

import React, { useState } from 'react'
import { auth, db } from '../firebase/firebaseConfig'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      // Get user ID
      const user = userCredential.user

      // Store user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      })

      // Redirect to home page
      router.push('/')
    } catch (error: any) {
      // Handle specific Firebase error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists')
          break
        case 'auth/invalid-email':
          setError('Invalid email address')
          break
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled')
          break
        case 'auth/weak-password':
          setError('Password is too weak')
          break
        default:
          setError(error.message || 'An error occurred during signup')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded px-4 py-2 text-sm font-medium" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="********"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
        <div className="text-center">
          <p className="mb-0 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </form>
    </>
  )
} 