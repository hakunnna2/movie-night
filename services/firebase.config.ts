import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBGnC6FPVUs25AdnrNKo8Sd1925v9ls2Pg",
  authDomain: "mood-cloud-b4e78.firebaseapp.com",
  projectId: "mood-cloud-b4e78",
  storageBucket: "mood-cloud-b4e78.firebasestorage.app",
  messagingSenderId: "576814878044",
  appId: "1:576814878044:web:cf16955937339109414599",
  databaseURL: "https://mood-cloud-b4e78-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
