import React from 'react'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}