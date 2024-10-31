import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";

initializeApp();

export const auth = getAuth();
export const firestore = getFirestore();
export const storage = getStorage();
