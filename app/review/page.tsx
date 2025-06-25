'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import questionSet from '../components/questionSet.json'
import { useRouter } from 'next/navigation'

const STANDARDS = [
    "math",
    "english",
    "reading",
    "science"
] as const;

type SubjectType = typeof STANDARDS[number];

interface Question {
    id: string;
    subject: string;
    question: string;
    standard: string;
    passageID?: string;
}

interface UserQuestion {
    selected: string;
    correct: boolean;
    date: number;
}

interface UserQuestions {
    [subject: string]: {
        old: {
            [questionId: string]: UserQuestion;
        };
        new: number[];
    };
}

export default function ReviewPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [userQuestions, setUserQuestions] = useState<UserQuestions>({});
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    // Filters
    const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'all'>('all');
    const [selectedStandard, setSelectedStandard] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'attempted' | 'new'>('all');
    const [selectedResult, setSelectedResult] = useState<'all' | 'correct' | 'wrong'>('all');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: '',
        end: ''
    });

    useEffect(() => {
        if (user) {
            loadUserQuestions();
        }
    }, [user]);

    const loadUserQuestions = async () => {
        if (!user) return;

        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            if (userData?.questions) {
                setUserQuestions(userData.questions as UserQuestions);
            }
        } catch (error) {
            console.error('Error loading user questions:', error);
        }
    };

    const loadQuestions = async (subject: SubjectType) => {
        setIsLoading(true);
        try {
            console.log('Loading questions for subject:', subject);
            const questionsRef = collection(db, subject);
            const snapshot = await getDocs(questionsRef);
            const loadedQuestions = snapshot.docs.map(doc => ({
                id: doc.id,
                subject: subject,
                ...doc.data()
            })) as Question[];
            console.log('Loaded questions:', loadedQuestions.length);
            setQuestions(loadedQuestions);
        } catch (error) {
            console.error('Error loading questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSubject !== 'all') {
            loadQuestions(selectedSubject);
        } else {
            setQuestions([]);
        }
    }, [selectedSubject]);

    const getQuestionStatus = (questionId: string, subject: string): 'attempted' | 'new' => {
        if (!userQuestions[subject]) {
            console.log('No user questions for subject:', subject);
            return 'new';
        }
        const status = userQuestions[subject].old[questionId] ? 'attempted' : 'new';
        console.log('Question status:', { questionId, subject, status });
        return status;
    };

    const getQuestionResult = (questionId: string, subject: string): 'correct' | 'wrong' | null => {
        if (!userQuestions[subject]?.old[questionId]) return null;
        return userQuestions[subject].old[questionId].correct ? 'correct' : 'wrong';
    };

    const getQuestionDate = (questionId: string, subject: string): number | null => {
        return userQuestions[subject]?.old[questionId]?.date || null;
    };

    const filteredQuestions = questions.filter(question => {
        // Subject filter
        if (selectedSubject !== 'all' && question.subject !== selectedSubject) {
            console.log('Filtered by subject:', question.id);
            return false;
        }

        // Standard filter
        if (selectedStandard !== 'all' && question.standard !== selectedStandard) {
            console.log('Filtered by standard:', question.id);
            return false;
        }

        // Status filter
        const status = getQuestionStatus(question.id, question.subject);
        if (selectedStatus !== 'all' && status !== selectedStatus) {
            console.log('Filtered by status:', question.id);
            return false;
        }

        // Result filter
        const result = getQuestionResult(question.id, question.subject);
        if (selectedResult !== 'all' && result !== selectedResult) {
            console.log('Filtered by result:', question.id);
            return false;
        }

        // Date filter
        const date = getQuestionDate(question.id, question.subject);
        if (dateRange.start && date && new Date(date) < new Date(dateRange.start)) {
            console.log('Filtered by start date:', question.id);
            return false;
        }
        if (dateRange.end && date && new Date(date) > new Date(dateRange.end)) {
            console.log('Filtered by end date:', question.id);
            return false;
        }

        return true;
    });

    console.log('Current state:', {
        selectedSubject,
        selectedStandard,
        selectedStatus,
        selectedResult,
        dateRange,
        questionsCount: questions.length,
        filteredCount: filteredQuestions.length,
        userQuestions
    });

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4">
            <h1 className="text-center text-3xl font-bold mb-8">Question Review</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                <div>
                    <select 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value as SubjectType | 'all')}
                    >
                        <option value="all">All Subjects</option>
                        {STANDARDS.map(subject => (
                            <option key={subject} value={subject}>
                                {subject.charAt(0).toUpperCase() + subject.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white"
                        value={selectedStandard}
                        onChange={(e) => setSelectedStandard(e.target.value)}
                    >
                        <option value="all">All Standards</option>
                        {selectedSubject !== 'all' && 
                            Object.keys(questionSet[selectedSubject]).map(standard => (
                                <option key={standard} value={standard}>
                                    {standard}
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div>
                    <select 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'attempted' | 'new')}
                    >
                        <option value="all">All Questions</option>
                        <option value="attempted">Attempted</option>
                        <option value="new">New</option>
                    </select>
                </div>
                <div>
                    <select 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white"
                        value={selectedResult}
                        onChange={(e) => setSelectedResult(e.target.value as 'all' | 'correct' | 'wrong')}
                    >
                        <option value="all">All Results</option>
                        <option value="correct">Correct</option>
                        <option value="wrong">Wrong</option>
                    </select>
                </div>
                <div>
                    <input 
                        type="date" 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        placeholder="Start Date"
                    />
                </div>
                <div>
                    <input 
                        type="date" 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        placeholder="End Date"
                    />
                </div>
            </div>

            {/* Questions Table */}
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                            <th className="py-3 px-4 text-left font-semibold">ID</th>
                            <th className="py-3 px-4 text-left font-semibold">Subject</th>
                            <th className="py-3 px-4 text-left font-semibold">Standard</th>
                            <th className="py-3 px-4 text-left font-semibold">Question</th>
                            <th className="py-3 px-4 text-left font-semibold">Status</th>
                            <th className="py-3 px-4 text-left font-semibold">Result</th>
                            <th className="py-3 px-4 text-left font-semibold">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-6">Loading questions...</td>
                            </tr>
                        ) : filteredQuestions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-6">No questions found</td>
                            </tr>
                        ) : (
                            filteredQuestions.map((question, idx) => {
                                const status = getQuestionStatus(question.id, question.subject);
                                const result = getQuestionResult(question.id, question.subject);
                                const date = getQuestionDate(question.id, question.subject);
                                return (
                                    <tr
                                        key={question.id}
                                        className={
                                            `${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer hover:bg-blue-50 transition`}
                                        onClick={() => router.push(`/review/questions?subject=${encodeURIComponent(question.subject)}&question=${encodeURIComponent(question.id)}`)}
                                    >
                                        <td className="py-2 px-4 font-mono">{question.id}</td>
                                        <td className="py-2 px-4 capitalize">{question.subject}</td>
                                        <td className="py-2 px-4">{question.standard}</td>
                                        <td className="py-2 px-4 max-w-xs truncate" title={question.question}>{question.question}</td>
                                        <td className="py-2 px-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                                                ${status === 'attempted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">
                                            {result && (
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                                                    ${result === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                >
                                                    {result}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 px-4">{date ? new Date(date).toLocaleDateString() : '-'}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
