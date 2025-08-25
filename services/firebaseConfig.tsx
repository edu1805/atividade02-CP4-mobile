import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore,collection,addDoc,getDocs,doc,updateDoc,deleteDoc } from "firebase/firestore";

//Vai permitir que seja realizado o getReactNativePersistence mesmo sem tipagem
const {getReactNativePersistence} = require("firebase/auth") as any;

const firebaseConfig = {
  apiKey: "AIzaSyAaGJ6m13wv0-1peWgNjNgfBso1zom0_OM",
  authDomain: "aulafirebaseauth-4cd4a.firebaseapp.com",
  projectId: "aulafirebaseauth-4cd4a",
  storageBucket: "aulafirebaseauth-4cd4a.firebasestorage.app",
  messagingSenderId: "454839252633",
  appId: "1:454839252633:web:4e84ee9adac419891aea08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

const auth = initializeAuth(app,{
  persistence:getReactNativePersistence(AsyncStorage)
});

export {auth,db,getFirestore,collection,addDoc,getDocs,doc,updateDoc,deleteDoc}
