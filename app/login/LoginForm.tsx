'use client'

import React, { useState } from 'react'
import { auth, db } from '../firebase/firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    if (!formData.email || !formData.password) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    try {
      // Sign in user with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      // Update lastLogin timestamp in Firestore
      const user = userCredential.user
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString()
      })

      // Redirect to home page
      router.push('/')
    } catch (error: any) {
      // Handle specific Firebase error codes
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Invalid email address')
          break
        case 'auth/user-disabled':
          setError('This account has been disabled')
          break
        case 'auth/user-not-found':
          setError('No account found with this email')
          break
        case 'auth/wrong-password':
          setError('Incorrect password')
          break
        default:
          setError('Failed to login. Please try again.')
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
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-2 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-center">
          <p className="mb-0 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </>
  )
} 