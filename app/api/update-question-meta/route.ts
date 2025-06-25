import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface BaseQuestion {
    question: string;
    choices: {
        A: string;
        B: string;
        C: string;
        D: string;
    };
    correct_answer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    standard: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export async function POST(request: NextRequest) {
    try {
        const { subject, question, id } = await request.json();
        
        const setPath = path.join(process.cwd(), 'app/components/questionSet.json');
        const levelsPath = path.join(process.cwd(), 'app/components/questionLevels.json');
        
        // Read files
        const [setRaw, levelsRaw] = await Promise.all([
            fs.readFile(setPath, 'utf-8'),
            fs.readFile(levelsPath, 'utf-8'),
        ]);
        
        const setData = JSON.parse(setRaw);
        const levelsData = JSON.parse(levelsRaw);
        
        // Update questionSet.json
        if (
            setData[subject] &&
            setData[subject][question.standard] &&
            !setData[subject][question.standard].includes(id)
        ) {
            setData[subject][question.standard].push(id);
        }
        
        // Update questionLevels.json
        if (
            levelsData[subject] &&
            levelsData[subject][question.difficulty] &&
            !levelsData[subject][question.difficulty].includes(id)
        ) {
            levelsData[subject][question.difficulty].push(id);
        }
        
        // Write back
        await Promise.all([
            fs.writeFile(setPath, JSON.stringify(setData, null, 4)),
            fs.writeFile(levelsPath, JSON.stringify(levelsData, null, 4)),
        ]);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating question meta:', error);
        return NextResponse.json({ error: 'Failed to update question meta' }, { status: 500 });
    }
} 