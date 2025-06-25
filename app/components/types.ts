export interface Question {
    id: number;
    subject: string;
    question: string;
    choices: {
        A: string,
        B: string,
        C: string,
        D: string
    },
    correct_answer: string;
    explanation: string;
    standard: string;
}

export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
    role: MessageRole;
    content: string;
} 