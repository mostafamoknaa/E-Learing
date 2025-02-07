import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyCBckLKiCtLIFvXX3SLfyCaszC-vFDL3JA",
    authDomain: "ecommerce-9d94f.firebaseapp.com",
    projectId: "ecommerce-9d94f",
    storageBucket: "ecommerce-9d94f.firebasestorage.app",
    messagingSenderId: "444404014366",
    appId: "1:444404014366:web:d1e5a5f10e5b90ca95fd0f",
    measurementId: "G-V7Q9HY61C5"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

onAuthStateChanged(auth, (user) => {
    if (user) {
        User(user.uid);
        Course(courseId);
    } else {
        window.location.href = "login.html";
    }
});

const certificateContainer = document.getElementById("certificate-container");
const certificateImage = document.getElementById("certificate-image");
const userName = document.getElementById("studentName");
const courseTitle = document.getElementById("course-title");


async function User(userId) {
    const userName = document.getElementById("studentName");
    try {
        const userRef = doc(db, "student", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            userName.textContent = userData.name || "No Name";
        } else {
            userName.textContent = "Unknown User";
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

async function Course(courseId) {
    try {
        const title = document.getElementById("courseName");
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            title.textContent = courseData.title;
        }
    } catch (error) {
        console.error("Error fetching course details:", error);
    }
}