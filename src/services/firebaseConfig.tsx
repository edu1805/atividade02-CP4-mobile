import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore,collection,addDoc,getDocs,doc,updateDoc,deleteDoc } from "firebase/firestore";

//Vai permitir que seja realizado o getReactNativePersistence mesmo sem tipagem
const {getReactNativePersistence} = require("firebase/auth") as any;

const firebaseConfig = {
  apiKey: "AIzaSyCR1jecuUVq_iHu9TsbRc6b5vgrS95dCI8",
  authDomain: "listatarefas-1c3ef.firebaseapp.com",
  projectId: "listatarefas-1c3ef",
  storageBucket: "listatarefas-1c3ef.firebasestorage.app",
  messagingSenderId: "461116563999",
  appId: "1:461116563999:web:9b5ee4d11fd2e5d7e3eb2a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app)

const auth = initializeAuth(app,{
  persistence:getReactNativePersistence(AsyncStorage)
});

export {auth,db,getFirestore,collection,addDoc,getDocs,doc,updateDoc,deleteDoc}
