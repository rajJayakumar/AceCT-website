'use client'

import React, { useState, useRef } from 'react'
import { Message } from './types';

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
    standard: string;
}

function LoadingDots() {
    return (
        <span className="inline-block w-6 text-center">
            <span className="animate-bounce inline-block">.</span>
            <span className="animate-bounce inline-block delay-150">.</span>
            <span className="animate-bounce inline-block delay-300">.</span>
        </span>
    );
}

export default function Chatbot({ question }: { question: BaseQuestion }) {
    const choicesText = Object.entries(question.choices)
        .map(([label, text]) => `${label}: ${text}`)
        .join(', ');
    
    const instruction = `You are a helpful ACT practice assistant. This is the specific question the user is on: ${question.question}. The available choices are: ${choicesText}. The correct answer is: ${question.correct_answer}. Try to keep your responses simple and concise. `
    const [messages, setMessages] = useState<Message[]>([{ role: 'system', content: instruction }]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [animatedContent, setAnimatedContent] = useState('');
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    // Typing animation for assistant
    const animateTyping = (text: string, onComplete?: () => void) => {
        setTyping(true);
        setAnimatedContent('');
        let i = 0;
        function typeChar() {
            setAnimatedContent(text.slice(0, i + 1));
            i++;
            if (i < text.length) {
                typingTimeout.current = setTimeout(typeChar, 18);
            } else {
                setTyping(false);
                if (onComplete) onComplete();
            }
        }
        typeChar();
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        setTyping(false);
        setAnimatedContent('');
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: newMessages,
                    instruction: instruction
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to get response');
            }
            const data = await response.json();
            const assistantMessage: Message = { 
                role: 'assistant', 
                content: data.content || 'Sorry, I am unable to answer that question.' 
            };
            setLoading(false);
            // Start typing animation instead of immediately adding to messages
            animateTyping(assistantMessage.content, () => {
                // Add the message to the array after typing completes
                setMessages([...newMessages, assistantMessage]);
            });
        } catch (err) {
            console.error(err);
            alert('Failed to send message.');
        }
    };

    // Clean up typing timeout on unmount
    React.useEffect(() => {
        return () => {
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, []);

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) {
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full justify-between">
            {/* Chat messages */}
            <div className="overflow-y-auto bg-white h-full px-2 py-2 space-y-2">
                {messages.slice(1).map((m, i) => (
                    <div key={i} className={`text-${m.role === 'user' ? 'right' : 'left'}`}>
                        <div className={`inline-block p-2 rounded ${m.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <strong>{m.role}:</strong> {m.content}
                        </div>
                    </div>
                ))}
                {/* Typing animation for assistant */}
                {typing && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm whitespace-pre-line bg-gray-100 text-gray-800 rounded-bl-md">
                            {animatedContent}
                            <span className="inline-block w-3 align-middle">
                                <span className="animate-blink">|</span>
                            </span>
                        </div>
                    </div>
                )}
                {/* Loading animation */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm bg-gray-100 text-gray-800 rounded-bl-md">
                            <LoadingDots />
                        </div>
                    </div>
                )}
            </div>
            {/* Input area */}
            <div className="mt-4 flex items-center gap-2">
                <input
                    className="flex-grow p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={loading}
                />
                <button
                    className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition flex items-center justify-center disabled:opacity-50 ${loading ? 'cursor-not-allowed' : ''}`}
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    aria-label="Send"
                >
                    {loading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    ) : (
                        <i className="bi bi-send text-lg"></i>
                    )}
                </button>
            </div>
        </div>
    )
}