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

// ✅ Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ DOM Elements
const userName = document.getElementById("user-name");
const userEmail = document.getElementById("user-email");
const userAvatar = document.getElementById("user-avatar");
const gridContainer = document.querySelector(".grid");
const logoutButton = document.getElementById("logout-button");

// ✅ Fetch User Profile Data
async function fetchUserProfile(userId) {
    try {
        const userRef = doc(db, "student", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            userName.textContent = userData.name || "No Name";
            userEmail.textContent = userData.email || "No Email"; // 🔹 Fix: Fetch email properly
            userAvatar.src = userData.avatar || "images/Avatar.png";
        } else {
            userName.textContent = "Unknown User";
            userEmail.textContent = "No Email Found";
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

// ✅ Fetch Completed Courses
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

            // ✅ Fetch Course Details
            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
                const courseInfo = courseSnap.data();
                courses.push({
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
        gridContainer.innerHTML = "<p>Error loading courses.</p>";
    }
}

// ✅ Render Completed Courses on Profile Page
function renderCourses(courses) {
    gridContainer.innerHTML = "";
    courses.forEach((course) => {
        const courseElement = document.createElement("div");
        courseElement.classList.add("course-card");
        courseElement.innerHTML = `
            <img src="${course.image}" alt="${course.title}">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <p><strong>Category:</strong> ${course.category}</p>
        `;
        gridContainer.appendChild(courseElement);
    });
}

// ✅ Monitor User Authentication Status
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserProfile(user.uid);
        fetchCompletedCourses(user.uid);
    } else {
        window.location.href = "login.html"; // Redirect to login if user is not logged in
    }
});

// ✅ Logout Functionality
logoutButton.addEventListener("click", async() => {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Error logging out:", error);
    }
});