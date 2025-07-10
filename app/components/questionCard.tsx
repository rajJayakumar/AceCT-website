'use client'

import React from 'react'

interface BaseQuestion {
    id: number;
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

interface QuestionCardProps {
    question: BaseQuestion;
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

    // Define the order of choices to ensure A, B, C, D
    const choiceOrder = ['A', 'B', 'C', 'D'] as const;

    return (
        <div className="bg-white rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-none p-8 w-full">
            <p className="text-gray-500 text-base mb-4">{`${question.id}. ${question.standard}`}</p>
            <p className="text-xl font-semibold mb-6">{question.question}</p>
            <ul className="flex flex-col gap-5 mb-6">
                {choiceOrder.map((label) => {
                    const text = question.choices[label];
                    const isSelected = selectedChoice === label;
                    const showCorrect = isSubmitted && label === question.correct_answer;
                    const showIncorrect = isSubmitted && isSelected && !isCorrect;

                    return (
                        <li
                            key={label}
                            onClick={() => onChoice(label)}
                            className={`rounded-xl px-6 py-3 border cursor-pointer transition text-lg
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
                            <span className="font-bold mr-3">{label}:</span> {text}
                        </li>
                    );
                })}
            </ul>
            {isSubmitted && (
                <div className={`rounded-xl px-6 py-4 mb-6 font-semibold text-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="mb-2">{isCorrect ? 'Correct!' : 'Incorrect'}</div>
                    <div className="text-base font-normal">{question.explanation}</div>
                </div>
            )}
            {children && (
                <div className="mt-6">
                    {children}
                </div>
            )}
        </div>
    )
} 