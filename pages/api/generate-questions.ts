import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { subject } = req.body;
  if (!subject) return res.status(400).json({ error: 'Missing subject' });

  const prompt = `You are generating ACT-style practice questions in JSON format for a high-quality educational app.

## Guidelines:
- Use the correct JSON format based on the subject.
- Math: generate 10 individual questions using the BaseQuestion structure.
- Reading, English, Science: generate 1 full PassageQuestion with a passage and associated questions.
- Each question must be unique, high quality, and clearly aligned to the ACT exam.
- Questions should be realistic, engaging, and test relevant cognitive skills (not just trivial recall).
- Distribute difficulty levels (easy, medium, hard) across the set.
- Each question must include a standard from the provided list for the selected subject.
- Do **not** explain anything — only return valid JSON.

## Structures:

### BaseQuestion (used for Math):

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
PassageQuestion (used for Reading, English, Science):
interface BasePassage {
    type: string;
    passage: string; //full length passage: Reading 700-900, English 300-400, Science 150-300 words
}

interface PassageQuestion {
    passage: BasePassage;
    questions: BaseQuestion[];
}
Subject Standards:
Math:
number and quantity


algebra


functions


geometry


statistics and probability


English:
topic development in terms of purpose & focus


organization, unity, and cohesion


knowledge of language


sentence structure and formation


usage conventions


punctuation conventions


Reading:
close reading


central ideas, themes, and summaries


relationships


word meanings and word choice


text structure


purpose and point of view


arguments


multiple texts


Science:
interpretation of data


scientific investigation


evaluation of models, inferences, & experimental results


Your Task:
Generate practice content for this subject: ${subject}
If subject is Math, output a JSON array of 10 BaseQuestion objects.


If subject is Reading, English, or Science, output a valid PassageQuestion object:


Reading: 10 questions


English: 15 questions


Science: 7 questions


Use varied standards and difficulties. Output should be clean, valid JSON output only, with no extra fluff or explanation.
`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });
    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || '';
    // Try to parse JSON from the response
    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch {
      // Try to extract JSON from markdown/code block
      const match = text.match(/```json([\s\S]*?)```/);
      if (match) {
        questions = JSON.parse(match[1]);
      } else {
        throw new Error('Could not parse questions JSON');
      }
    }
    res.status(200).json({ questions });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'OpenAI error' });
  }
} 