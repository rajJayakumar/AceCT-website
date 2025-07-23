'use client'

import React, { useState, useEffect } from 'react'
import Chatbot from '../components/chatbot'
import QuestionCard from '../components/questionCard'
import DesmosCalculator from '../components/DesmosCalculator'
import FilterSelectors from '../components/FilterSelectors'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import { useSearchParams } from 'next/navigation'
import questionSet from '../components/questionSet.json'
import levelSet from '../components/questionLevels.json'
import { CalculatorIcon } from '@heroicons/react/24/solid';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { useAuthRedirect } from '../hooks/useAuthRedirect';

const SUBJECT_COLORS = {
    math: "bg-blue-400",
    science: "bg-emerald-400", 
    reading: "bg-rose-400",
    english: "bg-yellow-400"
}

const STANDARDS = {
    math: [
        'number and quantity',
        'algebra',
        'functions',
        'geometry',
        'statistics and probability'
    ],
    english: [
        'topic development in terms of purpose & focus',
        'organization, unity, and cohesion',
        'knowledge of language',
        'sentence structure and formation',
        'usage conventions',
        'punctuation conventions'
    ],
    reading: [
        'close reading',
        'central ideas, themes, and summaries',
        'relationships',
        'word meanings and word choice',
        'text structure',
        'purpose and point of view',
        'arguments',
        'multiple texts'
    ],
    science: [
        'interpretation of data',
        'scientific investigation',
        'evaluation of models, inferences, & experimental results'
    ]
} as const;

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;

type SubjectType = keyof typeof STANDARDS;
type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

interface Passage {
    id: number;
    type: string;
    passage: string;
    subject: string;
}

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

interface QuestionSet {
    [key: string]: {
        [key: string]: number[];
    };
}

const typedQuestionSet = questionSet as QuestionSet;
const typedLevelSet = levelSet as QuestionSet;

export default function PracticeClient() {
    useAuthRedirect();
    const [currentQuestion, setCurrentQuestion] = useState<RegularQuestion | null>(null);
    const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
    const [selectedChoice, setSelectedChoice] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [subject, setSubject] = useState<SubjectType | null>(null);
    const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
    const [lastPassageId, setLastPassageId] = useState<string | null>(null);
    const [currentQID, setCurrentQID] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [showCalculator, setShowCalculator] = useState(true);
    const [isCorrect, setIsCorrect] = useState(false);
    const [oldQuestions, setOldQuestions] = useState<Set<number>>(new Set());
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
    const [selectedLevels, setSelectedLevels] = useState<DifficultyLevel[]>([...DIFFICULTY_LEVELS]);
    const [timer, setTimer] = useState(0);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const [accuracy, setAccuracy] = useState(100);
    const [totalAnswered, setTotalAnswered] = useState(0);
    const [totalCorrect, setTotalCorrect] = useState(0);
    const [startQID, setStartQID] = useState<number | null>(null);
    const [noMoreQuestions, setNoMoreQuestions] = useState(false);
    const [aiSidebarOpen, setAISidebarOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    // Initialize subject from URL parameters and set standards
    useEffect(() => {
        const subjectParam = searchParams?.get('subject')?.toLowerCase();
        console.log('URL subject param:', subjectParam);
        
        if (subjectParam && subjectParam in STANDARDS) {
            console.log('Setting subject to:', subjectParam);
            setSubject(subjectParam as SubjectType);
            // Automatically select all standards for the subject
            const standards = [...STANDARDS[subjectParam as SubjectType]];
            setSelectedStandards(standards);
            console.log('Selected standards:', standards);
        }
    }, [searchParams]);

    // Fetch new questions when subject changes
    useEffect(() => {
        if (user && subject) {
            setIsLoadingQuestions(true);
            init().finally(() => setIsLoadingQuestions(false));
        }
    }, [user, subject]);

    // Fetch next question when standards change or questions are loaded
    useEffect(() => {
        if (subject && selectedStandards.length > 0 && !isLoadingQuestions) {
            setCurrentQID(startQID);
            console.log(`startQID: ${startQID}`);
            console.log(`current ID reset: ${startQID}`);
            fetchNextQuestion(startQID ?? undefined);
        }
    }, [subject, selectedStandards, selectedLevels, isLoadingQuestions]);

    // Start timer on new question
    useEffect(() => {
        if (!currentQuestion) return;
        setTimer(0);
        if (intervalId) clearInterval(intervalId);
        const id = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
        setIntervalId(id);
        return () => clearInterval(id);
    }, [currentQuestion?.id]);

    const init = async () => {
        if (!user || !subject) {
            console.log('No user or subject:', { user: !!user, subject });
            return;
        }
        
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            setUserData(userData); // Save for later use
            if (!userData?.questions?.[subject]) { return; }

            const subjectQuestions = userData.questions[subject];
            setOldQuestions(new Set<number>(Object.keys(subjectQuestions.old).map(Number)));
            const id = subjectQuestions.startQID ? subjectQuestions.startQID : 1;
            setStartQID(id)
            setCurrentQID(id)
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const getNextValidQID = (qidOverride?: number): number | null => {
        if (!subject) {
            console.warn('Subject not defined.');
            return null;
        }
    
        const lastID = qidOverride ?? currentQID;
        console.log(`lastID: ${lastID}`);
    
        // Pre-cache sets for selected standards
        const standardSets: Set<number>[] = selectedStandards.map(
            (standard) => new Set(typedQuestionSet[subject][standard] || [])
        );
    
        // Pre-cache sets for selected difficulty levels
        const levelSets: Set<number>[] = selectedLevels.map(
            (level) => new Set(typedLevelSet[subject][level] || [])
        );

        for (let i = lastID || 1; i < 15; i++) {
            if (oldQuestions.has(i)) {
                console.log(`question ${i} is already in oldQuestions`);
                continue;
            }
    
            const standardFit = standardSets.some(set => set.has(i));
            const difficultyFit =
                selectedLevels.length === 0 || levelSets.some(set => set.has(i));
    
            if (standardFit && difficultyFit) {
                console.log(`question ${i} is a valid question`);
                setCurrentQID(i)
                setNoMoreQuestions(false);
                return i;
            }
        }
    
        setNoMoreQuestions(true);
        return null;
    };

    const fetchNextQuestion = async (qidOverride?: number) => {
        if (!subject || !user) {
            console.log('Cannot fetch questions:', { subject, user: !!user });
            return;
        }
        
        setIsLoading(true);
        try {
            const validId = getNextValidQID(qidOverride);
            if (!validId) {
                return;
            }

            const questionDoc = await getDoc(doc(db, subject, validId.toString()));
            if (!questionDoc.exists()) {
                console.log('Question not found:', validId);
                return;
            }

            const foundQuestion = questionDoc.data() as RegularQuestion;
            setCurrentQuestion(foundQuestion);

            if (foundQuestion.passageID && foundQuestion.passageID !== lastPassageId) {
                const passageDoc = await getDoc(doc(db, 'passages', foundQuestion.passageID.toString()));
                const passageData = passageDoc.data() as Passage;
                setCurrentPassage(passageData);
                setLastPassageId(foundQuestion.passageID);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStandardToggle = (standard: string) => {
        setSelectedStandards(prev => 
            prev.includes(standard)
                ? prev.filter(s => s !== standard)
                : [...prev, standard]
        );
    };

    const toggleAllStandards = () => {
        if (subject && subject in STANDARDS) {
            setSelectedStandards(prev => 
                prev.length === STANDARDS[subject].length
                    ? []
                    : [...STANDARDS[subject]]
            );
        }
    };

    const handleLevelToggle = (level: DifficultyLevel) => {
        setSelectedLevels(prev => 
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
    };

    const toggleAllLevels = () => {
        setSelectedLevels(prev => 
            prev.length === DIFFICULTY_LEVELS.length
                ? []
                : [...DIFFICULTY_LEVELS]
        );
    };

    const handleNext = async () => {
        fetchNextQuestion()
        setSelectedChoice('');
        setIsSubmitted(false);
    };

    const handleSubmit = async () => {
        if (!selectedChoice || !user || !subject || !currentQuestion) return;

        setIsSubmitted(true);
        const isCorrect = selectedChoice === currentQuestion.correct_answer;
        setIsCorrect(isCorrect);

        // Stop timer
        if (intervalId) clearInterval(intervalId);

        // Update local state
        // const updatedQuestions = new Set(newQuestions);
        // updatedQuestions.delete(currentQuestion.id);
        // setNewQuestions(updatedQuestions);

        // Update local accuracy state
        setTotalAnswered((prev) => prev + 1);
        setTotalCorrect((prev) => prev + (isCorrect ? 1 : 0));
        setAccuracy((prevAccuracy) => {
            const newTotal = totalAnswered + 1;
            const newCorrect = totalCorrect + (isCorrect ? 1 : 0);
            return Math.round((newCorrect / newTotal) * 100);
        });
        //setCurrentQID(currentQuestion.id)
        console.log(startQID, "cur:", currentQuestion.id)
        if (startQID === currentQuestion.id) {
            setStartQID(startQID + 1)
        }
        setOldQuestions(prev => prev.add(parseInt(currentQuestion.id.toString())))
        console.log(oldQuestions)

        try {
            let data = userData;
            // Fallback: fetch if not loaded (shouldn't happen in normal flow)
            if (!data) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                data = userDoc.data();
                setUserData(data);
            }
            const questions = data?.questions || {};
            const subjectQuestions = questions[subject] || { old: {}, blackList: []};

            await updateDoc(doc(db, 'users', user.uid), {
                //startQID: startQID,
                questions: {
                    ...questions,
                    [subject]: {
                        old: {
                            ...subjectQuestions.old,
                            [currentQuestion.id]: {
                                selected: selectedChoice,
                                correct: isCorrect,
                                date: Date.now(),
                                time: timer, // store time in seconds
                                timeSpent: timer // also store as timeSpent for dashboard compatibility
                            }
                        },
                        startQID: startQID,
                        //new: Array.from(updatedQuestions),
                       //blackList: subjectQuestions.blackList + currentQuestion.id,
                        //lastQID: currentQuestion.id
                    }
                }
            });
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    };

    const toggleAI = () => {
        setAISidebarOpen(prev => !prev);
    };

    // Format timer as mm:ss
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(1, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    if (isLoading) {
        return <div className="text-center mt-10 text-lg font-semibold">Loading questions...</div>;
    }

    if (!currentQuestion && !currentPassage) {
        return (
            <div className="text-center mt-10">
                <h3 className="text-xl font-bold mb-2">No questions available for the selected standards</h3>
                <p className="text-gray-600">Please select different standards to view questions.</p>
            </div>
        );
    }

    const questionToDisplay = currentQuestion

    if (!questionToDisplay) {
        return <div className="text-center mt-10 text-lg font-semibold">No question available</div>;
    }

    if (noMoreQuestions) {
        return (
            <div className="text-center mt-10">
                <h3 className="text-xl font-bold mb-2">No more valid questions available.</h3>
                <p className="text-gray-600">Try changing your standards or difficulty filters.</p>
            </div>
        );
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
                <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-4 py-2 transition disabled:opacity-50"
                    onClick={handleNext}
                    disabled={!isSubmitted || isLoading}
                >
                    Next
                </button>
                {subject === 'math' && (
                    <button 
                        type="button"
                        onClick={() => setShowCalculator((prev) => !prev)}
                    >
                        <CalculatorIcon className="w-10 h-10 text-black" />
                    </button>
                )}
                
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

    return (
        <div className="relative w-full max-w-8xl mx-auto px-40 py-30">
            <div className={`flex flex-col md:flex-row gap-8 transition-all duration-300 ${aiSidebarOpen ? 'md:translate-x-[-220px]' : ''}`}
                style={{ willChange: 'transform' }}>
                {/* Left Sidebar */}
                <div className={`flex flex-col gap-6 w-full ${aiSidebarOpen ? ' pl-20 md:w-1/5' : 'md:w-1/5'} max-w-xs`}>
                    <div className={`rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-6 text-center ${subject ? SUBJECT_COLORS[subject] : "bg-white"}`}>
                        <h2 className="text-2xl font-bold text-white mb-2">{subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : ''}</h2>
                    </div>
                    {/* Standards and Difficulty Selectors */}
                    <div className="bg-white rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-6">
                        <FilterSelectors
                            subject={subject}
                            selectedStandards={selectedStandards}
                            selectedLevels={selectedLevels}
                            onStandardToggle={handleStandardToggle}
                            onLevelToggle={handleLevelToggle}
                            onToggleAllStandards={toggleAllStandards}
                            onToggleAllLevels={toggleAllLevels}
                            standards={subject ? STANDARDS[subject] : []}
                            difficultyLevels={DIFFICULTY_LEVELS}
                        />
                    </div>
                    {/* Info Cards */}
                    <div className="bg-white rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-6 flex items-center justify-between">
                        { aiSidebarOpen ? '' : <span className="font-semibold text-lg text-gray-700">Time</span> }
                        <span className="text-3xl font-bold text-blue-600">{formatTime(timer)}</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-6 flex items-center justify-between">
                        { aiSidebarOpen ? '' : <span className="font-semibold text-lg text-gray-700">Accuracy</span> }
                        <span className="text-3xl font-bold text-green-600">{accuracy}%</span>
                    </div>
                </div>
                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Calculator for math with sliding animation, always on the left */}
                        {subject === 'math' && (
                            <div
                                className={`order-1 relative transition-all duration-500 flex-none
                                    ${showCalculator ? 'w-full md:w-1/2' : 'w-0 md:w-0'}
                                `}
                                style={{ minWidth: 0 }}
                            >
                                <div
                                    className={`absolute inset-0 transition-all duration-500
                                        ${showCalculator ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-full pointer-events-none'}
                                    `}
                                >
                                    <DesmosCalculator show={showCalculator} />
                                </div>
                            </div>
                        )}
                        {/* Passage */}
                        {(subject === 'reading' || subject === 'english' || subject === 'science') && currentPassage && (
                            <div className="w-full md:w-2/3">
                                <div className="bg-white rounded-xl shadow p-4 h-full flex flex-col">
                                    <h5 className="font-semibold mb-2">Passage</h5>
                                    <div className="overflow-y-auto max-h-[400px] text-gray-700 whitespace-pre-wrap">
                                        {currentPassage.passage}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* QuestionCard always on the right, animates width */}
                        <div
                            className={`order-2 flex flex-col gap-6 transition-all duration-500
                                ${subject === 'math' && showCalculator ? 'w-full md:w-1/2' : 'w-full'}
                            `}
                            style={{ minWidth: 0 }}
                        >
                            <QuestionCard 
                                question={questionToDisplay}
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
            <div className={`fixed top-0 right-0 h-full w-[350px] z-40 bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col ${aiSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{maxHeight: '100vh'}}>
                <div className="flex items-center justify-between mb-2 p-6 border-b">
                    <h5 className="font-semibold text-lg mb-0 mt-15">AceCT Assistant</h5>
                    <button type="button" className="text-gray-400 hover:text-gray-700 text-2xl mt-15" onClick={toggleAI} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    <Chatbot question={questionToDisplay} />
                </div>
            </div>
        </div>
    )
}

// subjects {
//     reading: {
//         old: {1 : true, 3 : false, 4 : true, ...} // questions user already completed, true means correct false means wrong
//         new: [2, 5, 6, ...] // questions the user hasn't seen yet
//     }
//     math: {} // repeat same structure for rest of subjects
//     english: {}
//     science: {}
// }