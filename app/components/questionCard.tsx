'use client'

import React from 'react'

interface BaseQuestion {
    question: string;
    choices: {
        A: string,
        B: string,
        C: string,
        D: string
    };
    correct_answer: string;
    explanation: string;
    standard?: string;
}

interface RegularQuestion extends BaseQuestion {
    id: number;
    subject: string;
}

type Question = BaseQuestion | RegularQuestion;

interface QuestionCardProps {
    question: Question;
    selectedChoice: string;
    onChoice: (choice: string) => void;
    isSubmitted: boolean;
    isCorrect: boolean;
    children?: React.ReactNode;
}

export default function QuestionCard({
    question,
    selectedChoice,
    onChoice,
    isSubmitted,
    isCorrect,
    children
}: QuestionCardProps) {
    // const isCorrect = selectedChoice === question.correct_answer;

    return (
        <div className="bg-white rounded-xl shadow p-6 w-full">
            <p className="text-gray-500 text-sm mb-2">{question.standard}</p>
            <p className="text-lg font-semibold mb-4">{question.question}</p>
            <ul className="flex flex-col gap-3 mb-4">
                {Object.entries(question.choices).map(([label, text]) => {
                    const isSelected = selectedChoice === label;
                    const showCorrect = isSubmitted && label === question.correct_answer;
                    const showIncorrect = isSubmitted && isSelected && !isCorrect;

                    return (
                        <li
                            key={label}
                            onClick={() => onChoice(label)}
                            className={`rounded-lg px-4 py-2 border cursor-pointer transition text-center
                                ${showCorrect ? 'bg-green-100 text-green-800 border-green-300' :
                                showIncorrect ? 'bg-red-100 text-red-800 border-red-300' :
                                isSelected ? 'bg-blue-100 border-blue-500' :
                                'bg-gray-50 hover:bg-blue-50 border-gray-200'}
                            `}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onChoice(label);
                                }
                            }}
                        >
                            <span className="font-bold mr-2">{label}:</span> {text}
                        </li>
                    );
                })}
            </ul>
            {isSubmitted && (
                <div className={`rounded-lg px-4 py-3 mb-4 font-semibold ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="mb-1 text-base">{isCorrect ? 'Correct!' : 'Incorrect'}</div>
                    <div className="text-sm font-normal">{question.explanation}</div>
                </div>
            )}
            {children && (
                <div className="mt-4">
                    {children}
                </div>
            )}
        </div>
    )
} 