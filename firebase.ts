import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBObhfq0LjWaf-5CbSrd6chzcHM0VEiPjA",
  authDomain: "cmdb-35a42.firebaseapp.com",
  projectId: "cmdb-35a42",
  storageBucket: "cmdb-35a42.appspot.com",
  messagingSenderId: "828229738682",
  appId: "1:828229738682:web:3d4e9bc2522bc8213e6283",
  measurementId: "G-8044QWTV61",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
