'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import questionSet from '../components/questionSet.json'
import { useRouter } from 'next/navigation'
import { useAuthRedirect } from '../hooks/useAuthRedirect';

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
    reviewed?: boolean;
}

interface UserQuestions {
    [subject: string]: {
        old: {
            [questionId: string]: UserQuestion;
        };
    };
}

export default function ReviewPage() {
    useAuthRedirect();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [userQuestions, setUserQuestions] = useState<UserQuestions>({});
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    // Filters
    const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'all'>('all');
    const [selectedStandard, setSelectedStandard] = useState<string>('all');
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

    const loadQuestions = async (subject: SubjectType | 'all') => {
        setIsLoading(true);

        try {
            if (subject === 'all') {
                const allSubjects: SubjectType[] = ['math', 'reading', 'english', 'science'];
                const allSnapshots = await Promise.all(
                    allSubjects.map(async (subj) => {
                        const ref = collection(db, subj);
                        const snap = await getDocs(ref);
                        return snap.docs.map(doc => ({
                            id: doc.id,
                            subject: subj,
                            ...doc.data()
                        }));
                    })
                );

                const combinedQuestions = allSnapshots.flat() as Question[];
                setQuestions(combinedQuestions);
            } else {
                const questionsRef = collection(db, subject);
                const snapshot = await getDocs(questionsRef);
                const loadedQuestions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    subject: subject,
                    ...doc.data()
                })) as Question[];
                setQuestions(loadedQuestions);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadQuestions(selectedSubject);
    }, [selectedSubject]);

    // Only show previously answered questions (in old)
    const getQuestionStatus = (questionId: string, subject: string): 'correct' | 'wrong' | null => {
        const q = userQuestions[subject]?.old?.[questionId];
        if (!q) return null;
        return q.correct ? 'correct' : 'wrong';
    };

    const getQuestionReviewed = (questionId: string, subject: string): boolean => {
        const q = userQuestions[subject]?.old?.[questionId];
        return !!q?.reviewed;
    };

    const getQuestionDate = (questionId: string, subject: string): number | null => {
        return userQuestions[subject]?.old[questionId]?.date || null;
    };

    const filteredQuestions = questions.filter(question => {
        // Only show attempted questions (in old)
        const status = getQuestionStatus(question.id, question.subject);
        if (!status) return false;
        // Subject filter
        if (selectedSubject !== 'all' && question.subject !== selectedSubject) {
            return false;
        }
        // Standard filter
        if (selectedStandard !== 'all' && question.standard !== selectedStandard) {
            return false;
        }
        // Result filter
        if (selectedResult !== 'all' && status !== selectedResult) {
            return false;
        }
        // Date filter
        const date = getQuestionDate(question.id, question.subject);
        if (dateRange.start && date && new Date(date) < new Date(dateRange.start)) {
            return false;
        }
        if (dateRange.end && date && new Date(date) > new Date(dateRange.end)) {
            return false;
        }
        return true;
    });

    const SUBJECT_COLORS = {
        'math' : 'text-blue-800 bg-blue-100',
        'reading' : 'text-rose-800 bg-rose-100',
        'english' : 'text-yellow-800 bg-yellow-100',
        'science' : 'text-emerald-800 bg-emerald-100',
    }

    return (
        <div className="max-w-7xl mx-auto mt-8 px-4">
            <h1 className="text-center text-3xl font-bold mb-8">Question Review</h1>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div>
                    <select 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white shadow-lg transition-shadow duration-300 hover:shadow-none"
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
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white shadow-lg transition-shadow duration-300 hover:shadow-none"
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
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white shadow-lg transition-shadow duration-300 hover:shadow-none"
                        value={selectedResult}
                        onChange={(e) => setSelectedResult(e.target.value as 'all' | 'correct' | 'wrong')}
                    >
                        <option value="all">All Results</option>
                        <option value="correct">Correct</option>
                        <option value="wrong">Wrong</option>
                    </select>
                </div>
                <div className="flex items-center justify-center gap-2">
                    From:  
                    <input 
                        type="date" 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white shadow-lg transition-shadow duration-300 hover:shadow-none"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        placeholder="Start Date"
                    />
                </div>
                <div className="flex items-center justify-center gap-2">
                    To:
                    <input 
                        type="date" 
                        className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 bg-white shadow-lg transition-shadow duration-300 hover:shadow-none"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        placeholder="End Date"
                    />
                </div>
            </div>
            {/* Questions Table */}
            <div className="overflow-x-auto rounded-lg shadow-lg transition-shadow duration-300 hover:shadow-none">
                <table className="min-w-full bg-white text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-gray-700">
                            <th className="py-3 px-4 text-left font-semibold">ID</th>
                            <th className="py-3 px-4 text-left font-semibold">Subject</th>
                            <th className="py-3 px-4 text-left font-semibold">Standard</th>
                            <th className="py-3 px-4 text-left font-semibold">Question</th>
                            <th className="py-3 px-4 text-left font-semibold">Status</th>
                            <th className="py-3 px-4 text-left font-semibold">Reviewed</th>
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
                                const reviewed = getQuestionReviewed(question.id, question.subject);
                                const date = getQuestionDate(question.id, question.subject);
                                return (
                                    <tr
                                        key={`${question.subject}-${question.id}`}
                                        className={
                                            `${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer hover:bg-blue-50 transition`}
                                        onClick={() => router.push(`/review/questions?subject=${encodeURIComponent(question.subject)}&question=${encodeURIComponent(question.id)}`)}
                                    >
                                        <td className="py-2 px-4 font-mono">{question.id}</td>
                                        <td className="py-2 px-4 capitalize">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                                                ${SUBJECT_COLORS[question.subject as SubjectType]}`}
                                            >
                                                {question.subject}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">{question.standard}</td>
                                        <td className="py-2 px-4 max-w-xs truncate" title={question.question}>{question.question}</td>
                                        <td className="py-2 px-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                                                ${status === 'correct' ? 'bg-green-100 text-green-800' :
                                                  'bg-red-100 text-red-800'}`}
                                            >
                                                {status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold 
                                                ${reviewed ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'}`}
                                            >
                                                {reviewed ? 'Yes' : 'No'}
                                            </span>
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
