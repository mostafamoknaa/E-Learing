import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBckLKiCtLIFvXX3SLfyCaszC-vFDL3JA",
    authDomain: "ecommerce-9d94f.firebaseapp.com",
    projectId: "ecommerce-9d94f",
    storageBucket: "ecommerce-9d94f.appspot.com",
    messagingSenderId: "444404014366",
    appId: "1:444404014366:web:d1e5a5f10e5b90ca95fd0f",
    measurementId: "G-V7Q9HY61C5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

async function loadCourseContent() {
    if (!courseId) {
        alert("Invalid Course!");
        window.location.href = "index.html";
        return;
    }

    const courseRef = doc(db, "courses", courseId);

    onSnapshot(courseRef, (docSnap) => {
        if (docSnap.exists()) {
            const course = docSnap.data();
            document.getElementById("courseTitle").innerText = course.title;
            document.getElementById("courseDuration").innerText = course.duration;
            document.getElementById("courseImage").src = course.image;
            document.getElementById("courseInstructor").innerText = course.instructor;
            document.getElementById("coursePrice").innerText = course.price;
            document.getElementById("courseDescription").innerText = course.description;

            const videoContainer = document.getElementById("videoContainer");

            if (!course.content || course.content.length === 0) {
                videoContainer.innerHTML = "<p class='no-content'>No videos available for this course.</p>";
            } else {
                videoContainer.innerHTML = "";
                course.content.forEach(videoUrl => {
                    if (videoUrl.trim()) {
                        const iframe = document.createElement("iframe");
                        iframe.src = videoUrl.trim();
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.allowFullscreen = true;
                        videoContainer.appendChild(iframe);
                    }
                });
            }
        } else {
            alert("Course not found!");
            window.location.href = "index.html";
        }
    });
}


loadCourseContent();