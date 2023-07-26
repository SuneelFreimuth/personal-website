import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

const app = initializeApp({
    apiKey: "AIzaSyB9y0WCbUrgTQM7GTQ902NwqitrZQ7KGnk",
    authDomain: "directed-post-204701.firebaseapp.com",
    projectId: "directed-post-204701",
    storageBucket: "directed-post-204701.appspot.com",
    messagingSenderId: "937496524096",
    appId: "1:937496524096:web:63ae78d70f744319da36a5"
});

export const db = getFirestore(app);
