'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getDocument, setDocument, addDocument } from '@/lib/firebase/firestore';

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
          // Auto-create a default business for users skipping the setup flow (e.g. Google Auth)
          const businessId = await addDocument('businesses', {
            name: (firebaseUser.displayName?.split(' ')[0] || 'My') + "'s Business",
            industry: 'other',
            gstin: null,
            phone: firebaseUser.phoneNumber || null,
            ownerId: firebaseUser.uid,
            createdAt: new Date().toISOString()
          });

          userProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            currentBusinessId: businessId,
            businesses: [{ businessId, role: 'owner' }],
            plan: 'free',
            trialExpiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000) // 3 days from now
          };
          await setDocument('users', firebaseUser.uid, userProfile);
        } else if (!userProfile.currentBusinessId) {
          // Fix for existing users who already slipped through without a business
          const businessId = await addDocument('businesses', {
            name: (userProfile.name?.split(' ')[0] || 'My') + "'s Business",
            industry: 'other',
            ownerId: firebaseUser.uid,
            createdAt: new Date().toISOString()
          });
          userProfile.currentBusinessId = businessId;
          if (!userProfile.businesses) userProfile.businesses = [];
          userProfile.businesses.push({ businessId, role: 'owner' });
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
