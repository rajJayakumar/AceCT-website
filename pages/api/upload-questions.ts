import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../app/firebase/firebaseAdmin';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { subject, questions } = req.body;

  if (
    !subject ||
    !questions ||
    typeof questions !== 'object' ||
    !Array.isArray(questions.questions)
  ) {
    return res.status(400).json({ error: 'Missing or invalid subject or questions' });
  }

  try {
    const batch = db.batch();
    let passageID: string | null = null;

    // === If non-math subject, insert passage first ===
    if (subject.toLowerCase() !== 'math') {
      const passageSnapshot = await db.collection(`passages`).get();
      const passageCount = passageSnapshot.size;
      passageID = (passageCount + 1).toString();

      const passageRef = db.collection(`passages`).doc(passageID);
      batch.set(passageRef, {
        ...questions.passage,
        id: passageID,
        subject,
        timestamp: new Date().toISOString(),
      });
    }

    // === Firestore: Get question count to assign IDs ===
    const questionSnapshot = await db.collection(subject).get();
    const questionCount = questionSnapshot.size;

    // === Read local JSON files ===
    const setPath = path.join(process.cwd(), 'app/components/questionSet.json');
    const levelsPath = path.join(process.cwd(), 'app/components/questionLevels.json');

    const [setRaw, levelsRaw] = await Promise.all([
      fs.readFile(setPath, 'utf-8'),
      fs.readFile(levelsPath, 'utf-8'),
    ]);

    const setData = JSON.parse(setRaw);
    const levelsData = JSON.parse(levelsRaw);

    // === Process each question ===
    questions.questions.forEach((q: any, index: number) => {
      const newQuestionID = (questionCount + index + 1).toString();
      q.id = newQuestionID;
      if (passageID) q.passageID = passageID;

      const ref = db.collection(subject).doc(newQuestionID);
      batch.set(ref, q);

      const newID = Number.parseInt(newQuestionID)
      // --- Update setData ---
      if (
        setData[subject] &&
        q.standard &&
        setData[subject][q.standard] &&
        !setData[subject][q.standard].includes(newID)
      ) {
        setData[subject][q.standard].push(newID);
      }

      // --- Update levelsData ---
      if (
        levelsData[subject] &&
        q.difficulty &&
        levelsData[subject][q.difficulty] &&
        !levelsData[subject][q.difficulty].includes(newID)
      ) {
        levelsData[subject][q.difficulty].push(newID);
      }
    });

    // === Commit batch to Firestore ===
    await batch.commit();

    // === Write back to local files ===
    await Promise.all([
      fs.writeFile(setPath, JSON.stringify(setData, null, 4)),
      fs.writeFile(levelsPath, JSON.stringify(levelsData, null, 4)),
    ]);

    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
}