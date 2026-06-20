import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, getDocs, updateDoc, increment, serverTimestamp, limit } from "firebase/firestore";
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

export const signOutUser = () => {
    localStorage.removeItem('earnadda_uid');
    window.location.href = '/';
};

export const addReward = async (userId: string, type: 'spin' | 'scratch' | 'ad' | 'survey' | 'review', amount: number, description: string) => {
  const userRef = doc(db, 'users', userId);
  const activitiesRef = collection(db, 'users', userId, 'activities');
  
  await addDoc(activitiesRef, {
    type,
    amount,
    description,
    timestamp: serverTimestamp()
  });

  await setDoc(userRef, {
    balance: increment(amount)
  }, { merge: true });
};

export const updateUserProfileData = async (userId: string, data: { displayName?: string, photoURL?: string }) => {
  const userRef = doc(db, 'users', userId);
  const dbData: any = {};
  if (data.displayName !== undefined) dbData.name = data.displayName;
  if (data.photoURL !== undefined) dbData.photoURL = data.photoURL;
  
  if (Object.keys(dbData).length > 0) {
    await updateDoc(userRef, dbData);
  }
};
