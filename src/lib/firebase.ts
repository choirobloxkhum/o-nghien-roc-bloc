import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import rawConfig from '../../firebase-applet-config.json';

// ============================================================================
// HƯỚNG DẪN CẤU HÌNH FIREBASE (FIREBASE CONFIGURATION)
// ============================================================================
// Nếu bạn muốn dùng Firebase Console của riêng bạn, bạn có thể thay thế các giá trị
// dưới đây bằng thông tin lấy từ:
// Firebase Console -> Project Settings -> General -> Your apps -> Web app -> SDK setup and configuration:
export const FIREBASE_CONFIG = {
  apiKey: rawConfig.apiKey || "AIzaSyCwvK_sM9KNIcPtK_H6zdCxMWZMtXRVL4Y",
  authDomain: rawConfig.authDomain || "gen-lang-client-0387748439.firebaseapp.com",
  projectId: rawConfig.projectId || "gen-lang-client-0387748439",
  storageBucket: rawConfig.storageBucket || "gen-lang-client-0387748439.firebasestorage.app",
  messagingSenderId: rawConfig.messagingSenderId || "386018727251",
  appId: rawConfig.appId || "1:386018727251:web:2f7f1e35bd858be45f7da6",
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || "ai-studio-nghinrcblc-3354e9e2-e576-428c-83be-905bb52d87ac",
};

// 1. Initialize Firebase App (Singleton pattern)
export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];

// 2. Initialize Firestore Database instance
export const db: Firestore = getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);

// 3. Initialize Firebase Auth instance
export const auth: Auth = getAuth(app);

// ============================================================================
// FIRESTORE ERROR HANDLER (Theo chuẩn Firebase Security & Monitoring)
// ============================================================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {},
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}
