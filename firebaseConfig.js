import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDnHcjfFMbqxaSu_3ru76odnW2lsHCchGk",
  authDomain: "wearher-423400.firebaseapp.com",
  databaseURL: "https://wearher-423400.firebaseio.com",
  projectId: "wearher-423400",
  storageBucket: "wearher-423400.appspot.com",
  messagingSenderId: "400944893414",
  appId: "1:400944893414:android:ad8f11606fa7e3c9aa5a27",
  measurementId: "8183247097"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const firestore = getFirestore(app);

export { auth, firestore };