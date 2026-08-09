import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCw5K1TKm_kO5JZ3_CIIKTlBGXseqhhTxw",
    authDomain: "ats-project-296c2.firebaseapp.com",
    projectId: "ats-project-296c2",
    storageBucket: "ats-project-296c2.firebasestorage.app",
    messagingSenderId: "645443967527",
    appId: "1:645443967527:web:877d9e40312a178ad74c02",
    measurementId: "G-8WQ5YJ3GL7",

    // apiKey: "AIzaSyDtW2NGYVSw5cM887ddXpltHlEtTJU1Wr0",
    // authDomain: "ats-testing-project-4cba8.firebaseapp.com",
    // projectId: "ats-testing-project-4cba8",
    // storageBucket: "ats-testing-project-4cba8.firebasestorage.app",
    // messagingSenderId: "1093728468133",
    // appId: "1:1093728468133:web:9982593962c7b68ec2a14c",
    // measurementId: "G-0BSPBM5R3C",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;
