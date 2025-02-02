import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBckLKiCtLIFvXX3SLfyCaszC-vFDL3JA",
    authDomain: "ecommerce-9d94f.firebaseapp.com",
    projectId: "ecommerce-9d94f",
    storageBucket: "ecommerce-9d94f.firebasestorage.app",
    messagingSenderId: "444404014366",
    appId: "1:444404014366:web:d1e5a5f10e5b90ca95fd0f",
    measurementId: "G-V7Q9HY61C5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Select the course container
const courseList = document.querySelector(".course-list");

// Function to Fetch & Display Courses from Firebase
async function fetchCourses() {
    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        courseList.innerHTML = ""; // Clear previous courses

        querySnapshot.forEach((docSnap) => {
            const course = docSnap.data();

            // Create a course card
            const courseCard = document.createElement("div");
            courseCard.classList.add("course-card");

            courseCard.innerHTML = `
                <img src="${course.image}" alt="${course.title}">
                <h3>${course.title}</h3><br>
            `;

            courseList.appendChild(courseCard);
        });

    } catch (error) {
        console.error("Error fetching courses:", error);
    }
}

// Load Courses on Page Load
document.addEventListener("DOMContentLoaded", fetchCourses);