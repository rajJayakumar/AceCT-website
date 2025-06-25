import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { messages, instruction } = await request.json();

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: instruction },
                ...messages.slice(1).map((m: any) => ({ 
                    role: m.role, 
                    content: m.content 
                }))
            ],
        });

        return NextResponse.json({ 
            content: response.choices[0].message.content 
        });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
} 