'use client'
import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { db } from "@/app/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import QuestionCard from "@/app/components/questionCard";
import Chatbot from "@/app/components/chatbot";
import ReviewNotes from "../reviewNotes";

type SubjectType = 'english' | 'reading' | 'math' | 'science';

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
    selected_answer?: string;
}

interface Passage {
    id: string;
    type: string;
    passage: string;
    subject: string;
}

const subjects: SubjectType[] = ['english', 'reading', 'math', 'science'];

export default function ReviewQuestionPage() {
    const [currentQuestion, setCurrentQuestion] = useState<RegularQuestion | null>(null);
    const [currentPassage, setCurrentPassage] = useState<Passage | null>(null);
    const [selectedChoice, setSelectedChoice] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [subject, setSubject] = useState<SubjectType | null>(null);
    const [questionID, setQuestionID] = useState<string | null>(null);
    const [showAI, setShowAI] = useState(false);
    const [lastPassageId, setLastPassageId] = useState<string | null>(null);
    
    const { user } = useAuth();
    const searchParams = useSearchParams();

    // Initialize subject from URL parameters
    useEffect(() => {
        const subjectParam = searchParams.get('subject')?.toLowerCase();
        const questionIDParam = searchParams.get('question');
        
        if (subjectParam && questionIDParam && subjects.includes(subjectParam as SubjectType)) {
            setSubject(subjectParam as SubjectType);
            setQuestionID(questionIDParam);
        }
    }, [searchParams]);

    // Fetch question when subject and questionID are set
    useEffect(() => {
        if (subject && questionID) {
            fetchQuestion();
        }
    }, [subject, questionID]);

    const fetchQuestion = async () => {
        if (!subject || !questionID || !user) {
            console.error("Subject or questionID not provided");
            return;
        }

        setIsLoading(true);
        try {
            const questionDoc = await getDoc(doc(db, subject, questionID));
            const userQuestionDoc = await getDoc(doc(db, 'users', user.uid))
            if (questionDoc.exists() && userQuestionDoc.exists()) {
                const question = questionDoc.data() as RegularQuestion;
                const userQuestions = userQuestionDoc.data().questions[subject]
                const oldQs = userQuestions.old
                const selectedAns = oldQs[questionID].selected
                setSelectedChoice(selectedAns)
                setCurrentQuestion(question);

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
                console.error("Question not found");
            }
        } catch (error) {
            console.error("Error fetching question:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!currentQuestion || !selectedChoice) return;
        
        const correct = selectedChoice === currentQuestion.correct_answer;
        setIsCorrect(correct);
        setIsSubmitted(true);
    };

    const toggleAI = () => {
        setShowAI(prev => !prev);
    };

    if (isLoading) {
        return <div className="text-center mt-5">Loading question...</div>;
    }

    if (!currentQuestion) {
        return <div className="text-center mt-5">No question available</div>;
    }

    const buttons = (
<div className="d-flex justify-content-between align-items-center mt-3">
                                <div>
                                    <button 
                                        className="btn btn-primary me-2" 
                                        onClick={handleSubmit}
                                        disabled={!selectedChoice || isSubmitted}
                                    >
                                        {isSubmitted ? "Submitted" : "Submit"}
                                    </button>
                                </div>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={toggleAI}
                                >
                                    <i className="bi bi-send me-2"></i>
                                    Ask AceCT
                                </button>
                            </div>
    )

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <h1 className="text-center mb-4">
                        {subject ? subject.charAt(0).toUpperCase() + subject.slice(1) : ''} Question Review
                    </h1>
                    
                    <div className="row">
                        {(subject && subject !== 'math' && currentPassage) && (
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
                        
                        <div className={subject !== 'math' && currentPassage ? "col-md-6" : "col-md-12"}>
                            <QuestionCard 
                                question={currentQuestion}
                                selectedChoice={selectedChoice}
                                onChoice={setSelectedChoice}
                                isSubmitted={isSubmitted}
                                isCorrect={isCorrect}
                            />
                            
                            
                            {/* Review Notes Component */}
                            {isSubmitted && !isCorrect && currentQuestion && (
                                <ReviewNotes 
                                    subject={subject!} 
                                    questionId={currentQuestion.id} 
                                />
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-2"></div>
            </div>
            
            {/* AI Panel */}
            {showAI && (
                <div className={`col-md-3 ${showAI ? 'show' : ''}`}>
                    <div className="card h-100">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">AceCT Assistant</h5>
                            <button type="button" className="btn-close" onClick={toggleAI} aria-label="Close"></button>
                        </div>
                        <div className="card-body">
                            <Chatbot question={currentQuestion} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}