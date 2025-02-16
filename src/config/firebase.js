import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Only import getAuth

const firebaseConfig = {
    apiKey: "AIzaSyBJP9mWSO0TIXZ1lWFwBEhGZ6KHCzCrH8c",
    authDomain: "kannanstores-a6abc.firebaseapp.com",
    databaseURL: "https://kannanstores-a6abc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "kannanstores-a6abc",
    storageBucket: "kannanstores-a6abc.appspot.com",
    messagingSenderId: "487283923603",
    appId: "1:487283923603:web:766e267c731a8eb9b38b66",
    measurementId: "G-VYE16MD1RK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
