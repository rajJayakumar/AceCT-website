import { db } from '../firebase/firebaseConfig';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

// Types from admin/page.tsx
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

interface BasePassage {
    type: string;
    passage: string;
}

interface PassageQuestion {
    passage: BasePassage;
    questions: BaseQuestion[];
}

interface FormattedQuestion extends BaseQuestion {
    id: number;
    passageID?: number;
}

interface FormattedPassage extends BasePassage {
    id: number;
    questionIDs: number[];
}

// Type guards
function isBaseQuestion(obj: any): obj is BaseQuestion {
    return obj && typeof obj.question === 'string' && obj.choices && typeof obj.correct_answer === 'string';
}
function isPassageQuestion(obj: any): obj is PassageQuestion {
    return obj && obj.passage && Array.isArray(obj.questions);
}

// Helper to update question meta via API
async function updateQuestionMeta(subject: string, question: BaseQuestion, id: number) {
    try {
        const response = await fetch('/api/update-question-meta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ subject, question, id }),
        });
        if (!response.ok) {
            console.warn('Failed to update question meta:', await response.text());
        }
    } catch (error) {
        console.warn('Error updating question meta:', error);
    }
}

// Main upload function
export async function uploadQuestionsToFirestore(
    subject: string,
    data: unknown
): Promise<void> {
    if (subject.toLowerCase() === 'math') {
        // Handle Math: BaseQuestion or BaseQuestion[]
        let questions: BaseQuestion[];
        if (Array.isArray(data)) {
            if (!data.every(isBaseQuestion)) throw new Error('Invalid Math questions array');
            questions = data;
        } else if (isBaseQuestion(data)) {
            questions = [data];
        } else {
            throw new Error('Invalid Math question data');
        }
        const questionsCol = collection(db, 'math');
        // Get current count
        const snapshot = await getDocs(questionsCol);
        let nextId = snapshot.size + 1;
        for (const q of questions) {
            const formatted: FormattedQuestion = {
                ...q,
                id: nextId,
            };
            await setDoc(doc(questionsCol, String(nextId)), formatted);
            await updateQuestionMeta('math', q, nextId);
            nextId++;
        }
    } else {
        // Handle PassageQuestion or PassageQuestion[]
        let passageQuestions: PassageQuestion[];
        if (Array.isArray(data)) {
            if (!data.every(isPassageQuestion)) throw new Error('Invalid PassageQuestions array');
            passageQuestions = data;
        } else if (isPassageQuestion(data)) {
            passageQuestions = [data];
        } else {
            throw new Error('Invalid PassageQuestion data');
        }
        const questionsCol = collection(db, subject.toLowerCase());
        const passagesCol = collection(db, 'passages');
        // Get current counts
        const qSnap = await getDocs(questionsCol);
        let nextQId = qSnap.size + 1;
        const pSnap = await getDocs(passagesCol);
        let nextPassageId = pSnap.size + 1;
        for (const pq of passageQuestions) {
            // Create passage
            const passageID = nextPassageId;
            const questionIDs: number[] = [];
            for (const q of pq.questions) {
                const formattedQ: FormattedQuestion = {
                    ...q,
                    id: nextQId,
                    passageID: passageID,
                };
                await setDoc(doc(questionsCol, String(nextQId)), formattedQ);
                await updateQuestionMeta(subject.toLowerCase(), q, nextQId);
                questionIDs.push(nextQId);
                nextQId++;
            }
            const formattedPassage: FormattedPassage = {
                ...pq.passage,
                id: passageID,
                questionIDs,
            };
            await setDoc(doc(passagesCol, String(passageID)), formattedPassage);
            nextPassageId++;
        }
    }
} 