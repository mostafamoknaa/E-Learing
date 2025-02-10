import {
    db,
    auth,
    onAuthStateChanged,
    onSnapshot,
    addDoc,
    getDocs,
    query,
    where,
    collection,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    logout
} from "./module.js";

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

document.getElementById("logout-btn").addEventListener("click", logout);