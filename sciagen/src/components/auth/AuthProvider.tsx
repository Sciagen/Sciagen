'use client';
// ─────────────────────────────────────────────────────────────────────────────
// AUTH PROVIDER — Global auth context
// ─────────────────────────────────────────────────────────────────────────────
import {
  createContext, useContext, useEffect, useState,
  ReactNode, useCallback,
} from 'react';
import { User } from 'firebase/auth';
import { observeAuthState, getCurrentUserProfile } from '@/lib/firebase/auth';
import { SciUser } from '@/lib/types';

interface AuthContextValue {
  user:          User | null;
  userProfile:   SciUser | null;
  loading:       boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user:          null,
  userProfile:   null,
  loading:       true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<SciUser | null>(null);
  const [loading,     setLoading]     = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    const profile = await getCurrentUserProfile(u.uid);
    setUserProfile(profile);
  }, []);

  useEffect(() => {
    const unsub = observeAuthState(async (u) => {
      setUser(u);
      if (u) {
        await loadProfile(u);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user);
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
