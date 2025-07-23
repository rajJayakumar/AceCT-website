'use client'
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/app/components/questionCard";
import Chatbot from "@/app/components/chatbot";
import ReviewNotes from "../reviewNotes";
import questionLevels from "@/app/components/questionLevels.json";
import questionSet from "@/app/components/questionSet.json";
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

type SubjectType = 'english' | 'reading' | 'math' | 'science';

interface RegularQuestion {
    id: number;
    subject: string;
    question: string;
    choices: {
        A: string,
        B: string,
        C: string,
        D: string
    };
    correct_answer: string;
    explanation: string;
    standard: string;
    passageID?: string;
}

interface Passage {
    id: number;
    type: string;
    passage: string;
    subject: string;
}

const SUBJECT_COLORS: Record<string, string> = {
    math: 'bg-blue-100 text-blue-800',
    english: 'bg-yellow-100 text-yellow-800',
    reading: 'bg-rose-100 text-rose-800',
    science: 'bg-emerald-100 text-emerald-800',
};

function getDifficulty(subject: string, id: number): string | null {
    const levels = (questionLevels as Record<string, Record<string, number[]>>)[subject];
    if (!levels) return null;
    for (const level of Object.keys(levels)) {
        if (levels[level].includes(id)) return level;
    }
    return null;
}

function getStandard(subject: string, id: number): string | null {
    const standards = (questionSet as Record<string, Record<string, number[]>>)[subject];
    if (!standards) return null;
    for (const [standard, ids] of Object.entries(standards)) {
        if ((ids as number[]).includes(id)) return standard;
    }
    return null;
}

const subjects: SubjectType[] = ['english', 'reading', 'math', 'science'];

export default function ReviewQuestionPage() {
    useAuthRedirect();
    const [currentQuestion, setCurrentQuestion] = useState<RegularQuestion | null>(null);
    const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
    const [selectedChoice, setSelectedChoice] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [subject, setSubject] = useState<SubjectType | null>(null);
    const [questionID, setQuestionID] = useState<number | null>(null);
    const [lastPassageId, setLastPassageId] = useState<string | null>(null);
    const [reviewNotesFilled, setReviewNotesFilled] = useState(false);
    const [isReviewed, setIsReviewed] = useState(false);
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [aiSidebarOpen, setAISidebarOpen] = useState(false);
    const [timeTaken, setTimeTaken] = useState<number | null>(null);

    // Initialize subject from URL parameters
    useEffect(() => {
        const subjectParam = searchParams?.get('subject')?.toLowerCase();
        const questionIDParam = searchParams?.get('question');
        if (subjectParam && questionIDParam && subjects.includes(subjectParam as SubjectType)) {
            setSubject(subjectParam as SubjectType);
            setQuestionID(parseInt(questionIDParam));
        }
    }, [searchParams]);

    // Fetch question when subject and questionID are set
    useEffect(() => {
        if (subject && questionID) {
            fetchQuestion();
        }
    }, [subject, questionID]);

    const fetchQuestion = async () => {
        if (!subject || !questionID || !user) return;
        setIsLoading(true);
        try {
            const questionDoc = await getDoc(doc(db, subject, questionID.toString()));
            let reviewed = false;
            let time = null;
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.data();
                const questions = userData?.questions || {};
                const subjectQuestions = questions[subject] || { old: {}, blackList: [] };
                reviewed = !!subjectQuestions.old?.[questionID]?.reviewed;
                time = subjectQuestions.old?.[questionID]?.time || subjectQuestions.old?.[questionID]?.timeSpent || null;
            }
            if (questionDoc.exists()) {
                const question = questionDoc.data() as RegularQuestion;
                setCurrentQuestion(question);
                setSelectedChoice(''); // No pre-selection
                setIsSubmitted(false);
                setIsCorrect(false);
                setIsReviewed(reviewed);
                setTimeTaken(time);
                // Load passage if question has passageID and subject is not math
                if (question.passageID && subject !== 'math' && question.passageID !== lastPassageId) {
                    const passageDoc = await getDoc(doc(db, 'passages', question.passageID.toString()));
                    if (passageDoc.exists()) {
                        const passageData = passageDoc.data() as Passage;
                        setCurrentPassage(passageData);
                        setLastPassageId(question.passageID);
                    }
                }
            } else {
                setCurrentQuestion(null);
            }
        } catch (error) {
            setCurrentQuestion(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to mark as reviewed if both correct and notes filled
    const tryMarkReviewed = async (correct: boolean, notesFilled: boolean) => {
        if (!user || !subject || !currentQuestion) return;
        if (correct && notesFilled && !isReviewed) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            const questions = userData?.questions || {};
            const subjectQuestions = questions[subject] || { old: {}, blackList: [] };
            await updateDoc(doc(db, 'users', user.uid), {
                questions: {
                    ...questions,
                    [subject]: {
                        ...subjectQuestions,
                        old: {
                            ...subjectQuestions.old,
                            [currentQuestion.id]: {
                                ...subjectQuestions.old?.[currentQuestion.id],
                                reviewed: true
                            }
                        }
                    }
                }
            });
            setIsReviewed(true);
        }
    };

    // Listen for review notes filled (from ReviewNotes child)
    const handleReviewNotesFilled = (filled: boolean) => {
        setReviewNotesFilled(filled);
        tryMarkReviewed(isCorrect, filled);
    };

    const handleSubmit = async () => {
        if (!currentQuestion || !selectedChoice) return;
        const correct = selectedChoice === currentQuestion.correct_answer;
        setIsCorrect(correct);
        setIsSubmitted(true);
        tryMarkReviewed(correct, reviewNotesFilled);
    };

    const toggleAI = () => {
        setAISidebarOpen((v) => !v);
        console.log(aiSidebarOpen);
    };

    if (isLoading) {
        return <div className="text-center mt-5">Loading question...</div>;
    }

    if (!currentQuestion) {
        return <div className="text-center mt-5">No question available</div>;
    }

    const buttons = (
        <div className="flex flex-row gap-2 justify-between items-center mt-2">
            <div className="flex gap-2">
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 transition disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={!selectedChoice || isSubmitted}
                >
                    {isSubmitted ? "Submitted" : "Submit"}
                </button>
            </div>
            <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 flex items-center gap-2 transition"
                type="button"
                onClick={toggleAI}
            >
                Ask AceCT
                <PaperAirplaneIcon className="w-5 h-5 text-white"/>
            </button>
        </div>
    )

    const difficulty = subject && currentQuestion ? getDifficulty(subject, currentQuestion.id) : null;
    const standard = subject && currentQuestion ? getStandard(subject, currentQuestion.id) : null;

    return (
        <div className="relative w-full max-w-7xl mx-auto px-2 py-30">
            <div className={`flex flex-col md:flex-row gap-6 transition-all duration-300 ${aiSidebarOpen ? 'md:translate-x-[-200px]' : ''}`}
                style={{ willChange: 'transform' }}>
                {/* Left Sidebar */}
                <div className="flex flex-col gap-4 w-full md:w-1/4 max-w-xs">
                    <div className={`rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-4 text-center ${subject ? SUBJECT_COLORS[subject] : 'bg-gray-100 text-gray-800'}`}> 
                        <h2 className="text-xl font-bold mb-1 capitalize">{subject}</h2>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700">Standard</span>
                            <span className="text-gray-800 text-sm font-medium">{standard || currentQuestion?.standard || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700">Difficulty</span>
                            <span className="text-gray-800 text-sm font-medium capitalize">{difficulty || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700">Time</span>
                            <span className="text-gray-800 text-sm font-medium">{timeTaken !== null ? `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s` : '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700">Reviewed</span>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isReviewed ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'}`}>{isReviewed ? 'Yes' : 'No'}</span>
                        </div>
                        <span className="text-gray-600 text-sm font-small">Complete Question Analysis and answer question correctly</span>
                    </div>
                    <ReviewNotes 
                        subject={subject!} 
                        questionId={currentQuestion.id} 
                        onReviewNotesFilled={handleReviewNotesFilled}
                    />
                </div>
                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {(subject === 'reading' || subject === 'english' || subject === 'science') && currentPassage && (
                            <div className="w-full md:w-1/2">
                                <div className="bg-white rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-4 h-full flex flex-col">
                                    <h5 className="font-semibold mb-2">Passage</h5>
                                    <div className="overflow-y-auto max-h-[400px] text-gray-700 whitespace-pre-wrap">
                                        {currentPassage.passage}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="w-full md:w-1/2 flex flex-col gap-4">
                            <QuestionCard 
                                question={currentQuestion}
                                selectedChoice={selectedChoice}
                                onChoice={setSelectedChoice}
                                isSubmitted={isSubmitted}
                                isCorrect={isCorrect}
                                children={buttons}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* AI Sidebar (slide-in) */}
            <div className={`fixed top-0 right-0 h-full w-[340px] z-40 bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col ${aiSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{maxHeight: '100vh'}}>
                <div className="flex items-center justify-between mb-2 p-4 border-b">
                    <h5 className="font-semibold mb-0 mt-15">AceCT Assistant</h5>
                    <button type="button" className="text-gray-400 hover:text-gray-700 mt-15" onClick={() => setAISidebarOpen(false)} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    <Chatbot question={currentQuestion} />
                </div>
            </div>
        </div>
    );
}