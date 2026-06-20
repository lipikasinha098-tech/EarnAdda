import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, getDocs, updateDoc, increment, serverTimestamp, limit } from "firebase/firestore";
import firebaseConfig from '../../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    const user = res.user;
    
    // Check if user exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        balance: 0,
        createdAt: serverTimestamp(),
      });
    }
    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signOutUser = () => fbSignOut(auth);

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
  const user = auth.currentUser;
  if (user && user.uid === userId) {
    await updateProfile(user, {
      displayName: data.displayName || user.displayName,
      photoURL: data.photoURL || user.photoURL
    });
  }

  const userRef = doc(db, 'users', userId);
  const dbData: any = {};
  if (data.displayName !== undefined) dbData.name = data.displayName;
  if (data.photoURL !== undefined) dbData.photoURL = data.photoURL;
  
  if (Object.keys(dbData).length > 0) {
    await updateDoc(userRef, dbData);
  }
};
