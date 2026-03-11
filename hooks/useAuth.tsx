'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getDocument, setDocument } from '@/lib/firebase/firestore';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentBusinessId: string | null;
  businesses: { businessId: string; role: 'owner' | 'admin' | 'staff' }[];
  plan: 'free' | 'starter' | 'professional';
  trialExpiresAt: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  businessId: string | null;
  isPremium: boolean;
  logout: () => Promise<void>;
  updateCurrentBusiness: (businessId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  businessId: null,
  isPremium: false,
  logout: async () => {},
  updateCurrentBusiness: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch or create user profile
        let userProfile = await getDocument<UserProfile>('users', firebaseUser.uid);
        
        if (!userProfile) {
          userProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            currentBusinessId: null,
            businesses: [],
            plan: 'free',
            trialExpiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000) // 3 days from now
          };
          await setDocument('users', firebaseUser.uid, userProfile);
        }
        
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const updateCurrentBusiness = async (businessId: string) => {
    if (!user) return;
    await setDocument('users', user.uid, { currentBusinessId: businessId });
    setProfile(prev => prev ? { ...prev, currentBusinessId: businessId } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      businessId: profile?.currentBusinessId || null,
      isPremium: profile ? (profile.plan !== 'free' || profile.trialExpiresAt > Date.now()) : false,
      logout,
      updateCurrentBusiness
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
