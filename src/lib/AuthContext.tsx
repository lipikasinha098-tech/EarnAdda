import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: { uid: string } | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        let storedUid = localStorage.getItem('earnadda_uid');
        if (!storedUid) {
          storedUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem('earnadda_uid', storedUid);
        }

        setUser({ uid: storedUid });

        const userRef = doc(db, 'users', storedUid);
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
             name: `User_${storedUid.slice(-4)}`,
             email: '',
             photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${storedUid}`,
             balance: 0,
             ipAddress: ipAddress,
             createdAt: serverTimestamp(),
           });
        }
      } catch (err) {
        console.error("Auto login failed:", err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docRef) => {
      if (docRef.exists()) {
        setProfile({ id: docRef.id, ...docRef.data() } as UserProfile);
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
