import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// ✅ Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBckLKiCtLIFvXX3SLfyCaszC-vFDL3JA",
    authDomain: "ecommerce-9d94f.firebaseapp.com",
    projectId: "ecommerce-9d94f",
    storageBucket: "ecommerce-9d94f.firebasestorage.app",
    messagingSenderId: "444404014366",
    appId: "1:444404014366:web:d1e5a5f10e5b90ca95fd0f",
    measurementId: "G-V7Q9HY61C5"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Select Feedback List Container
const feedbackList = document.getElementById("feedback-list");

// ✅ Fetch Feedback from Firebase
async function fetchFeedback() {
    try {
        const feedbackRef = collection(db, "feedback");
        const querySnapshot = await getDocs(feedbackRef);
        const feedbacks = [];

        querySnapshot.forEach((doc) => {
            feedbacks.push(doc.data());
        });

        renderFeedback(feedbacks);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        feedbackList.innerHTML = "<p>Error loading feedback.</p>";
    }
}


function renderFeedback(feedbacks) {
    feedbackList.innerHTML = "";

    if (feedbacks.length === 0) {
        feedbackList.innerHTML = "<p>No feedback available yet.</p>";
        return;
    }

    const name = getStudentName(feedbacks.userId);

    feedbacks.forEach((feedback) => {
        const feedbackCard = document.createElement("div");
        feedbackCard.classList.add("feedback-card");

        feedbackCard.innerHTML = `
            <img src="${feedback.userAvatar || 'images/Avatar.png'}" alt="User Avatar" class="user-avatar">
            <div class="feedback-content">
                <p class="feedback-user">${name || "Anonymous"}</p>
                <p class="rating">${generateStars(feedback.rating)}</p>
                <p class="feedback-text">${feedback.feedback || "No feedback provided."}</p>
            </div>
        `;

        feedbackList.appendChild(feedbackCard);
    });
}

async function getStudentName(studentId) {
    //console.log("Student ID:", studentId);
    if (!studentId) {
        return "Unknown";
    }

    try {
        const studentRef = doc(db, "student", studentId);
        const studentSnap = await getDoc(studentRef);

        const studentData = studentSnap.data();
        if (!studentSnap.exists() || !studentData.name) {
            return "Unknown Student";
        }

        return studentData.name.trim();
    } catch (error) {
        console.error("Error fetching student name:", error);
        return "Student";
    }
}


function generateStars(rating) {
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    return `<span>${stars}</span>`;
}

fetchFeedback();