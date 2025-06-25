'use client'

import React from 'react'
import { auth } from '../firebase/firebaseConfig'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut(auth)
            router.push('/login')
        } catch (error) {
            console.error('Error signing out:', error)
        }
    }

    return (
        <button 
            className="btn btn-outline-danger ms-auto" 
            onClick={handleLogout}
        >
            Logout
        </button>
    )
} 