import React from 'react'
import Link from 'next/link'

export default function SubjectSelect() {
    const subjects = [
        {
            name: 'Math',
            icon: 'calculator',
            color: 'primary',
            description: 'Practice mathematical concepts and problem-solving'
        },
        {
            name: 'Reading',
            icon: 'book',
            color: 'success',
            description: 'Improve reading comprehension and analysis'
        },
        {
            name: 'English',
            icon: 'translate',
            color: 'info',
            description: 'Enhance grammar, vocabulary, and writing skills'
        },
        {
            name: 'Science',
            icon: 'flask',
            color: 'warning',
            description: 'Explore scientific concepts and principles'
        }
    ]

    return (
        <div className="container py-5">
            <h1 className="text-center mb-5">Select a Subject</h1>
            <div className="row justify-content-center">
                {subjects.map((subject) => (
                    <div key={subject.name} className="col-md-6 col-lg-4 mb-4">
                        <Link href={`/practice?subject=${subject.name.toLowerCase()}`} className="text-decoration-none">
                            <div className={`card h-100 border-${subject.color} hover-shadow`}>
                                <div className="card-body text-center">
                                    <i className={`bi bi-${subject.icon} fs-1 text-${subject.color} mb-3`}></i>
                                    <h2 className="card-title h4">{subject.name}</h2>
                                    <p className="card-text text-muted">{subject.description}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}
