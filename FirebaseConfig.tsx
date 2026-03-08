// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth } from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import AsyncStorage from "@react-native-async-storage/async-storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  //apiKey: "AIzaSyD5DbUBqfwlq6FVQJt2bMUN6E9Bhh1_9g4",
  //authDomain: "checkmate-b4a03.firebaseapp.com",
  //databaseURL: "https://checkmate-b4a03-default-rtdb.firebaseio.com",
  projectId: "allomotors-14e75",
  //storageBucket: "checkmate-b4a03.firebasestorage.app",
  //messagingSenderId: "179140454124",
  appId: "1:1083026871981:android:8f72bbdf82b90a71c41824"
};
// Initialize Firebase
 const FIREBASE_APP = initializeApp(firebaseConfig);
 const FIREBASE_AUTH = getAuth(FIREBASE_APP);
 const FIRESTORE_DB = getFirestore(FIREBASE_APP);

export  { FIREBASE_APP, FIREBASE_AUTH, FIRESTORE_DB };
