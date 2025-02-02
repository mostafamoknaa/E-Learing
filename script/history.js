import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc, writeBatch, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);


const studentId = localStorage.getItem("studentId");

async function fetchCourseHistory() {
    if (!studentId) {
        console.error("Student ID not found.");
        return;
    }

    const gridContainer = document.querySelector(".grid");
    gridContainer.innerHTML = "";

    try {
        // 🔹 Get enrollment history for the student
        const enrollmentSnapshot = await getDocs(collection(db, "enrollment"));
        const enrolledCourses = [];

        enrollmentSnapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.studentId === studentId && data.status === "approved") {
                enrolledCourses.push(data.courseId);
            }
        });

        if (enrolledCourses.length === 0) {
            gridContainer.innerHTML = "<p>No courses enrolled yet.</p>";
            return;
        }

        // 🔹 Fetch course details
        for (const courseId of enrolledCourses) {
            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
                const course = courseSnap.data();
                displayCourse(course);
            }
        }

    } catch (error) {
        console.error("Error fetching course history:", error);
    }
}

// 🔹 Display Course Card
function displayCourse(course) {
    const gridContainer = document.querySelector(".grid");

    const courseCard = `
        <div class="card">
            <img src="${course.image || 'default-image.jpg'}" alt="${course.title}">
            <h2>${course.title}</h2>
            <p><strong>Instructor:</strong> ${course.instructor}</p>
            <p><strong>Category:</strong> ${course.category}</p>
            <p><strong>Duration:</strong> ${course.duration}</p>
        </div>
    `;

    gridContainer.innerHTML += courseCard;
}


window.onload = fetchCourseHistory;