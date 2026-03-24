// ─────────────────────────────────────────────────────────────────────────────
// SCIAGEN AUTH SERVICE — CLIENT SIDE
// ─────────────────────────────────────────────────────────────────────────────
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  AuthError,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { firebaseAuth, firebaseDb, googleProvider } from './client';
import { SciUser, UserRole }                        from '../types';

// ── Default preferences ───────────────────────────────────────────────────────

const defaultPreferences: SciUser['preferences'] = {
  theme:       'dark',
  fontSize:    18,
  fontFamily:  'reading',
  lineSpacing: 1.85,
  blueLight:   false,
  readingMode: 'scroll',
  ttsSpeed:    1.0,
  newsletter:  true,
  language:    'en',
};

// ── Create Firestore user document ───────────────────────────────────────────

async function createUserDocument(user: User, role: UserRole = 'user') {
  const ref = doc(firebaseDb, 'users', user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  const userData: Omit<SciUser, 'uid'> = {
    email:         user.email!,
    displayName:   user.displayName,
    photoURL:      user.photoURL,
    role,
    emailVerified: user.emailVerified,
    createdAt:     new Date().toISOString(),
    updatedAt:     new Date().toISOString(),
    preferences:   defaultPreferences,
    stats: {
      articlesRead:  0,
      readingTime:   0,
      bookmarks:     0,
      highlights:    0,
      notes:         0,
    },
  };

  await setDoc(ref, { ...userData, _serverCreatedAt: serverTimestamp() });
}

// ── Sign Up ───────────────────────────────────────────────────────────────────

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { user } = await createUserWithEmailAndPassword(
      firebaseAuth, email, password,
    );

    await updateProfile(user, { displayName });
    await sendEmailVerification(user, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login?verified=true`,
    });
    await createUserDocument(user);

    return { user, error: null };
  } catch (err) {
    const error = err as AuthError;
    return { user: null, error: mapAuthError(error.code) };
  }
}

// ── Sign In ───────────────────────────────────────────────────────────────────

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<{ user: User | null; error: string | null }> {
  try {
    const { user } = await signInWithEmailAndPassword(
      firebaseAuth, email, password,
    );
    await syncIdTokenCookie(user);
    return { user, error: null };
  } catch (err) {
    const error = err as AuthError;
    return { user: null, error: mapAuthError(error.code) };
  }
}

// ── Google Sign In ────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<{ user: User | null; error: string | null }> {
  try {
    const { user } = await signInWithPopup(firebaseAuth, googleProvider);
    await createUserDocument(user);
    await syncIdTokenCookie(user);
    return { user, error: null };
  } catch (err) {
    const error = err as AuthError;
    if (error.code === 'auth/popup-closed-by-user') return { user: null, error: null };
    return { user: null, error: mapAuthError(error.code) };
  }
}

// ── Sign Out ──────────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  await signOut(firebaseAuth);
  await fetch('/api/auth/session', { method: 'DELETE' });
}

// ── Password Reset ────────────────────────────────────────────────────────────

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  try {
    await sendPasswordResetEmail(firebaseAuth, email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
    });
    return { error: null };
  } catch (err) {
    const error = err as AuthError;
    return { error: mapAuthError(error.code) };
  }
}

// ── Get Current User Profile ──────────────────────────────────────────────────

export async function getCurrentUserProfile(uid: string): Promise<SciUser | null> {
  try {
    const ref = doc(firebaseDb, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { uid, ...snap.data() } as SciUser;
  } catch {
    return null;
  }
}

// ── Update User Preferences ───────────────────────────────────────────────────

export async function updateUserPreferences(
  uid: string,
  prefs: Partial<SciUser['preferences']>,
): Promise<void> {
  const ref = doc(firebaseDb, 'users', uid);
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(prefs)) {
    updates[`preferences.${k}`] = v;
  }
  updates['updatedAt'] = new Date().toISOString();
  await updateDoc(ref, updates);
}

// ── Auth State Observer ───────────────────────────────────────────────────────

export function observeAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, async (user) => {
    if (user) await syncIdTokenCookie(user);
    callback(user);
  });
}

// ── Sync ID Token to HttpOnly Cookie via API Route ────────────────────────────

async function syncIdTokenCookie(user: User) {
  const token = await user.getIdToken();
  await fetch('/api/auth/session', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token }),
  });
}

// ── Map Firebase auth error codes to readable messages ───────────────────────

function mapAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use':    'This email is already registered.',
    'auth/invalid-email':            'Please enter a valid email address.',
    'auth/user-not-found':           'No account found with this email.',
    'auth/wrong-password':           'Incorrect password. Please try again.',
    'auth/too-many-requests':        'Too many attempts. Please wait and try again.',
    'auth/network-request-failed':   'Network error. Check your connection.',
    'auth/user-disabled':            'This account has been disabled.',
    'auth/weak-password':            'Password must be at least 6 characters.',
    'auth/invalid-credential':       'Invalid credentials. Please try again.',
    'auth/requires-recent-login':    'Please sign in again to perform this action.',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
  };
  return map[code] ?? 'An unexpected error occurred. Please try again.';
}
