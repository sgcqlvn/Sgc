// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { 
    getAuth 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import { 
    getFirestore 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



// Cấu hình Firebase SGC

const firebaseConfig = {

  apiKey: "AIzaSyDyVBIG1GL1kJFBw-e-HktO49ysC5QOCps",

  authDomain: "sgcvn-19585.firebaseapp.com",

  projectId: "sgcvn-19585",

  storageBucket: "sgcvn-19585.firebasestorage.app",

  messagingSenderId: "614446665735",

  appId: "1:614446665735:web:b2b69b511f79c7d8bd9aa2"

};



// Khởi tạo

const app = initializeApp(firebaseConfig);



const auth = getAuth(app);


const db = getFirestore(app);



export {
    auth,
    db
};
