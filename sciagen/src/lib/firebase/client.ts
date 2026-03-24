// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE CLIENT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth, Auth,
  GoogleAuthProvider,
  connectAuthEmulator,
} from 'firebase/auth';
import {
  getFirestore, Firestore,
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
} from 'firebase/firestore';
import {
  getStorage, FirebaseStorage,
  connectStorageEmulator,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId:     process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ── Singleton pattern (safe for Next.js hot-reload) ──────────────────────────

let app:     FirebaseApp;
let auth:    Auth;
let db:      Firestore;
let storage: FirebaseStorage;

function initFirebase() {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);

  // Offline persistence (browser only, suppress SSR error)
  if (typeof window !== 'undefined') {
    enableMultiTabIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence: browser not supported');
      }
    });
  }

  // Emulators in local dev
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true'
  ) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
  }

  return { app, auth, db, storage };
}

const firebase = initFirebase();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const firebaseApp     = firebase.app;
export const firebaseAuth    = firebase.auth;
export const firebaseDb      = firebase.db;
export const firebaseStorage = firebase.storage;
