import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process any returning redirect result
    const processRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const u = result.user;
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
               name: u.displayName || 'Anonymous',
               email: u.email || '',
               photoURL: u.photoURL || '',
               balance: 0,
               createdAt: serverTimestamp(),
            });
          }
        }
      } catch (err) {
        console.error("Failed to process redirect result", err);
      }
    };
    processRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          // Auto sign-in anonymously
          const { signInAnonymously } = await import('firebase/auth');
          const result = await signInAnonymously(auth);
          setUser(result.user);
          
          const u = result.user;
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
             // Fetch IP Address
             let ipAddress = 'unknown';
             try {
               const ipRes = await fetch('https://api.ipify.org?format=json');
               const ipData = await ipRes.json();
               ipAddress = ipData.ip;
             } catch (err) {
               console.warn("Could not fetch IP address", err);
             }

             await setDoc(userRef, {
               name: 'Anonymous', // Default username
               email: '',
               photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`,
               balance: 0,
               ipAddress: ipAddress,
               createdAt: serverTimestamp(),
             });
          }
        } catch (err) {
          console.error("Auto login failed:", err);
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        setProfile({ id: doc.id, ...doc.data() } as UserProfile);
      }
      setLoading(false);
    });

    return () => unsubProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
