import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

const app = initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  // ... resto de config
});

export const db = getFirestore(app);
