import React from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h1 className="card-title text-center mb-4">Login</h1>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 