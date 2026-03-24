// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE ADMIN — SERVER-SIDE ONLY
// Used in Server Components, Route Handlers, and Middleware
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth }                     from 'firebase-admin/auth';
import { getFirestore, Firestore }           from 'firebase-admin/firestore';
import { getStorage, Storage }               from 'firebase-admin/storage';

let adminApp:     App;
let adminAuth:    Auth;
let adminDb:      Firestore;
let adminStorage: Storage;

function initAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey:  process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    };

    adminApp = initializeApp({
      credential:  cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    adminApp = getApps()[0];
  }

  adminAuth    = getAuth(adminApp);
  adminDb      = getFirestore(adminApp);
  adminStorage = getStorage(adminApp);

  return { adminApp, adminAuth, adminDb, adminStorage };
}

const admin = initAdmin();

export const adminApp_     = admin.adminApp;
export const adminAuth_    = admin.adminAuth;
export const adminDb_      = admin.adminDb;
export const adminStorage_ = admin.adminStorage;

// ── Helper: Verify ID token from cookie/header ────────────────────────────────

export async function verifySessionToken(token: string) {
  try {
    return await adminAuth_.verifyIdToken(token, true);
  } catch {
    return null;
  }
}

// ── Helper: Get user custom claims (role) ────────────────────────────────────

export async function getUserRole(uid: string): Promise<string> {
  try {
    const user = await adminAuth_.getUser(uid);
    return (user.customClaims as { role?: string })?.role ?? 'user';
  } catch {
    return 'user';
  }
}

// ── Helper: Set user role claim ──────────────────────────────────────────────

export async function setUserRole(uid: string, role: string) {
  await adminAuth_.setCustomUserClaims(uid, { role });
}
