import admin from 'firebase-admin'

if (!admin.apps.length) {
  const serviceAccountJSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountJSON) throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not defined');

  const decoded = Buffer.from(serviceAccountJSON, 'base64').toString('utf-8');

  let parsed;
  try {
    parsed = JSON.parse(decoded);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", err);
    throw err;
  }

  admin.initializeApp({
    credential: admin.credential.cert(parsed),
  });
}
export const db = admin.firestore();