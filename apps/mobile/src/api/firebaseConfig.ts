import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAZvwos1QwX7evXOcn-SbwtfHJUc_vaY9M",
  authDomain: "power-tap-65c62.firebaseapp.com",
  databaseURL: "https://power-tap-65c62-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "power-tap-65c62",
  storageBucket: "power-tap-65c62.firebasestorage.app",
  messagingSenderId: "593594273645",
  appId: "1:593594273645:web:aa6cdc0c1b45a234f85464"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
