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
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary w-100 mb-3"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-center">
          <p className="mb-0">
            Don't have an account?{' '}
            <Link href="/signup" className="text-decoration-none">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </>
  )
} 