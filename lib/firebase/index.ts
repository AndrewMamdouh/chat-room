import { FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, process.env.NEXT_PUBLIC_FIREBASE_REGION);
const storage = getStorage(app);

// Use emulator if running in development and emualtor is running
if (process.env.NEXT_PUBLIC_EMULATOR === "true") {
  //get server private ip before setting
  const serverIp = process.env.NEXT_PUBLIC_SERVER_IP
    ? process.env.NEXT_PUBLIC_SERVER_IP
    : "127.0.0.1";
  connectAuthEmulator(auth, `http://${serverIp}:9099`);
  connectFirestoreEmulator(db, serverIp, 8080);
  connectFunctionsEmulator(functions, serverIp, 5001);
  connectStorageEmulator(storage, serverIp, 9199);
}

export { auth, db, functions, storage };
