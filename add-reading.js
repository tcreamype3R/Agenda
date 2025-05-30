import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore/lite';

export default async (req, res) => {
  if (req.method === 'POST') {
    await addDoc(collection(db, 'readings'), req.body);
    res.status(200).json({ success: true });
  }
};
