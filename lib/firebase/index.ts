import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth';
import {
  getFirestore
} from 'firebase/firestore'
import {
  getFunctions
} from 'firebase/functions'
import {
  getStorage
} from 'firebase/storage'

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app)
const db = getFirestore(app)
const functions = getFunctions(app, process.env.NEXT_PUBLIC_FIREBASE_REGION)
const storage = getStorage(app)


export { auth, db, functions, storage }