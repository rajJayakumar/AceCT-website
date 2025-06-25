import React from 'react'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">Sign Up</h1>
              <SignupForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}