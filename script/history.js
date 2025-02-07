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
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

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


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


const gridContainer = document.querySelector(".grid");


async function fetchCompletedCourses(userId) {
    try {
        const completedCoursesQuery = query(
            collection(db, "coursecompleted"),
            where("userId", "==", userId),
            where("isCompleted", "==", true)
        );

        const querySnapshot = await getDocs(completedCoursesQuery);

        if (querySnapshot.empty) {
            gridContainer.innerHTML = "<p>No completed courses found.</p>";
            return;
        }

        const courses = [];

        for (const docSnap of querySnapshot.docs) {
            const courseData = docSnap.data();
            const courseId = courseData.courseId;


            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
                const courseInfo = courseSnap.data();
                courses.push({
                    id: courseId,
                    title: courseInfo.title || "Untitled Course",
                    image: courseInfo.image || "images/default-course.jpg",
                    description: courseInfo.description || "No description available.",
                    category: courseInfo.category || "No category" // 🔹 Fix: Fetch course category
                });
            }
        }

        renderCourses(courses);
    } catch (error) {
        console.error("Error fetching completed courses:", error);
        gridContainer.innerHTML = "<p>⚠️ Unable to load courses. Please try again later.</p>";
    }
}


function renderCourses(courses) {
    gridContainer.innerHTML = "";

    if (courses.length === 0) {
        gridContainer.innerHTML = "<p>No completed courses available.</p>";
        return;
    }

    courses.forEach((course) => {
        const courseElement = document.createElement("div");
        courseElement.classList.add("course-card");
        courseElement.innerHTML = `
            <img src="${course.image}" alt="${course.title}">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <p><strong>Category:</strong> ${course.category}</p>
            <button class="course-btn" data-id="${course.id}">View Course</button>
            <button class="certificate-btn" data-id="${course.id}">Certificate</button>
        `;
        gridContainer.appendChild(courseElement);
    });

    document.querySelectorAll(".course-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const courseId = e.target.dataset.id;
            window.location.href = `vidoes.html?courseId=${courseId}`;
        });
    });

    document.querySelectorAll(".certificate-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const courseId = e.target.dataset.id;
            window.location.href = `certificate.html?courseId=${courseId}`;
        });
    });
}




onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchCompletedCourses(user.uid);
    } else {
        gridContainer.innerHTML = "<p>Please log in to see your course history.</p>";
    }
});