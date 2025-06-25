'use client'

import React, { useState, useEffect } from 'react'
import QuestionCard from '../components/questionCard'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase/firebaseConfig'
import { useSearchParams } from 'next/navigation'
import questionSet from '../components/questionSet.json'

const STANDARDS = [
    "math",
    "english",
    "reading",
    "science"
] as const;

type SubjectType = typeof STANDARDS[number];

interface RegularQuestion {
    id: string;
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
    id: string;
    type: string;
    passage: string;
    subject: string;
}

interface QuestionSet {
    [key: string]: {
        [key: string]: number[];
    };
}

const typedQuestionSet = questionSet as QuestionSet;

export default function TestPage() {
    const [currentQuestion, setCurrentQuestion] = useState<RegularQuestion | null>(null);
    const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
    const [selectedChoice, setSelectedChoice] = useState('');
    const [subject, setSubject] = useState<SubjectType | null>(null);
    const [lastPassageId, setLastPassageId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [questionIds, setQuestionIds] = useState<number[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    // Initialize subject from URL parameters
    useEffect(() => {
        const subjectParam = searchParams.get('subject')?.toLowerCase();
        if (subjectParam && STANDARDS.includes(subjectParam as SubjectType)) {
            setSubject(subjectParam as SubjectType);
        }
    }, [searchParams]);

    // Load test questions when subject changes
    useEffect(() => {
        if (subject) {
            loadTestQuestions();
        }
    }, [subject]);

    // Load current question when index changes
    useEffect(() => {
        if (questionIds.length > 0 && currentIndex < questionIds.length) {
            loadQuestion(questionIds[currentIndex]);
        }
    }, [currentIndex, questionIds]);

    const loadTestQuestions = async () => {
        if (!subject) return;

        setIsLoading(true);
        try {
            // Get all questions for the subject
            const allQuestions = new Set<number>();
            const subjectQuestions = typedQuestionSet[subject];
            if (subjectQuestions) {
                Object.values(subjectQuestions).forEach(questions => {
                    questions.forEach((id: number) => allQuestions.add(id));
                });
            }

            // Convert to array and shuffle
            const shuffledQuestions = Array.from(allQuestions)
                .sort(() => Math.random() - 0.5)
                .slice(0, 20); // Take first 20 questions

            setQuestionIds(shuffledQuestions);
            setCurrentIndex(0);
        } catch (error) {
            console.error('Error loading test questions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadQuestion = async (questionId: number) => {
        if (!subject) return;

        setIsLoading(true);
        try {
            const questionDoc = await getDoc(doc(db, String(subject), questionId.toString()));
            if (!questionDoc.exists()) {
                console.log('Question not found:', questionId);
                return;
            }

            const foundQuestion = questionDoc.data() as RegularQuestion;
            setCurrentQuestion(foundQuestion);
            setSelectedChoice(answers[questionId.toString()] || '');

            if (foundQuestion.passageID && foundQuestion.passageID !== lastPassageId) {
                const passageDoc = await getDoc(doc(db, 'passages', foundQuestion.passageID));
                const passageData = passageDoc.data() as Passage;
                setCurrentPassage(passageData);
                setLastPassageId(foundQuestion.passageID);
            }
        } catch (error) {
            console.error('Error loading question:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChoice = (choice: string) => {
        if (!currentQuestion || !subject) return;
        
        setSelectedChoice(choice);
        setAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: choice
        }));

        // Save to Firestore
        if (user) {
            updateDoc(doc(db, 'users', user.uid), {
                [`test_answers.${String(subject)}.${currentQuestion.id}`]: choice
            }).catch(error => {
                console.error('Error saving answer:', error);
            });
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questionIds.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    if (isLoading) {
        return <div className="text-center mt-5">Loading questions...</div>;
    }

    if (!currentQuestion && !currentPassage) {
        return (
            <div className="text-center mt-5">
                <h3>No questions available</h3>
            </div>
        );
    }

    return (
        <div className='container-fluid'>
            <div className='row'>
                <div className='col-md-2'></div>
                <div className="col-md-8">
                    <h1 className="text-center mb-4">
                        {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : ''} Test
                    </h1>
                    <div className="text-center mb-4">
                        Question {currentIndex + 1} of {questionIds.length}
                    </div>
                    
                    <div className='row'>
                        {(subject && ['reading', 'english', 'science'].includes(subject) && currentPassage) && (
                            <div className="col-md-6">
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">Passage</h5>
                                        <div className="passage-content" style={{ 
                                            height: '100%', 
                                            overflowY: 'auto',
                                            maxHeight: '600px'
                                        }}>
                                            <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>
                                                {currentPassage.passage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="col-md-6">
                            {currentQuestion && (
                                <QuestionCard 
                                    question={currentQuestion}
                                    selectedChoice={selectedChoice}
                                    onChoice={handleChoice}
                                    isSubmitted={false}
                                    isCorrect={false}
                                />
                            )}
                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handlePrevious}
                                    disabled={currentIndex === 0}
                                >
                                    Previous
                                </button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleNext}
                                    disabled={currentIndex === questionIds.length - 1}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='col-md-2'></div>
            </div>
        </div>
    );
}
