import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

const cfg = (rawConfig as any)?.default || rawConfig || {};

const activeConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || cfg.apiKey || 'AIzaSyBttkZtyW07Q828m6MmzBv0OUc5S-LFfKA',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || cfg.authDomain || 'dealfast-9d7b6.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || cfg.projectId || 'dealfast-9d7b6',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || cfg.storageBucket || 'dealfast-9d7b6.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || cfg.messagingSenderId || '258178497761',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || cfg.appId || '1:258178497761:web:5cc47127f4e1b12bed8ba0',
  firestoreDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DB_ID || process.env.VITE_FIREBASE_FIRESTORE_DB_ID || cfg.firestoreDatabaseId || '(default)',
};

const app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
export const auth = getAuth(app);

// Safe auth persistence setup to avoid "Database is closing" IndexedDB issues in sandboxed iframes
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    setPersistence(auth, inMemoryPersistence).catch(() => {});
  });
}

const dbId = activeConfig.firestoreDatabaseId;
export const db = (!dbId || dbId === '(default)' || dbId === 'default') 
  ? getFirestore(app) 
  : getFirestore(app, dbId);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const msg = error instanceof Error ? error.message : String(error);
  // Gracefully handle network / offline / backend unreachable logs or closing IndexedDB without crashing
  if (msg.includes('Could not reach Cloud Firestore backend') || msg.includes('offline') || msg.includes('closing') || msg.includes('hidden') || msg.includes('Database')) {
    console.warn(`Firestore operating in offline/local fallback mode for ${operationType} on ${path}`);
    return error;
  }
  const errInfo = {
    error: msg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return error;
}
