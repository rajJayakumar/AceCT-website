import Link from 'next/link'
import React from 'react'
import LogoutButton from './LogoutButton'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
            <Link className="navbar-brand" href="/">Navbar</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
                <Link className="nav-link" href="/practice/select">Practice</Link>
                <Link className="nav-link" href="/statistics">Statistics</Link>
                <Link className="nav-link" href="/profile">Profile</Link>
            </div>
            <LogoutButton />
            </div>
        </div>
    </nav>
  )
}