import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    getDocs,
    addDoc,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;

// Listen for authentication changes
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) loadCourses();
});

// Elements
const registrationTable = document.getElementById("enrollment-table");
const statusFilter = document.getElementById("status-filter");

// Fetch enrollments based on selected status
async function fetchEnrollments() {
    const tableBody = registrationTable.querySelector("tbody");
    tableBody.innerHTML = "";

    const selectedStatus = statusFilter.value;

    try {
        const snapshot = await getDocs(collection(db, "enrollment"));

        for (const docSnap of snapshot.docs) {
            const request = docSnap.data();
            const requestId = docSnap.id;

            if (selectedStatus !== "all" && request.status !== selectedStatus) continue;

            const studentName = await getStudentName(request.studentId);
            const courseTitle = await getCourseTitle(request.courseId);

            const row = `
                <tr>
                    <td>${studentName}</td>
                    <td>${courseTitle}</td>
                    <td>${request.status}</td>
                    <td>
                        <button class="approve-btn" data-id="${requestId}" data-student="${request.studentId}" data-course="${request.courseId}">Approve</button>
                        <button class="reject-btn" data-id="${requestId}" data-student="${request.studentId}" data-course="${request.courseId}">Reject</button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        }

        attachEventListeners();
    } catch (error) {
        console.error("Error fetching enrollments:", error);
    }
}

// Fetch student name
async function getStudentName(studentId) {
    try {
        const studentSnap = await getDoc(doc(db, "student", studentId));
        return studentSnap.exists() ? studentSnap.data().name : "Unknown Student";
    } catch (error) {
        console.error("Error fetching student name:", error);
        return "Unknown Student";
    }
}

// Fetch course title
async function getCourseTitle(courseId) {
    try {
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        return courseSnap.exists() ? courseSnap.data().title : "Unknown Course";
    } catch (error) {
        console.error("Error fetching course title:", error);
        return "Unknown Course";
    }
}

// Approve enrollment request
async function approveRequest(requestId, studentId, courseId) {
    try {
        await updateDoc(doc(db, "enrollment", requestId), { status: "approved" });

        await sendNotification(studentId, `Your enrollment in "${await getCourseTitle(courseId)}" has been approved!`);

        alert("Enrollment approved!");
        fetchEnrollments();
    } catch (error) {
        console.error("Error approving request:", error);
    }
}

// Reject enrollment request
async function rejectRequest(requestId, studentId, courseId) {
    try {
        await updateDoc(doc(db, "enrollment", requestId), { status: "rejected" });

        await sendNotification(studentId, `Your enrollment in "${await getCourseTitle(courseId)}" has been rejected.`);

        alert("Enrollment rejected!");
        fetchEnrollments();
    } catch (error) {
        console.error("Error rejecting request:", error);
    }
}

// Send notification
async function sendNotification(studentId, message) {
    try {
        await addDoc(collection(db, "notifications"), {
            studentId,
            message,
            timestamp: serverTimestamp(),
            seen: false
        });
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

// Attach event listeners to buttons
function attachEventListeners() {
    document.querySelectorAll(".approve-btn").forEach(button => {
        button.addEventListener("click", async() => {
            const requestId = button.dataset.id;
            const studentId = button.dataset.student;
            const courseId = button.dataset.course;
            await approveRequest(requestId, studentId, courseId);
        });
    });

    document.querySelectorAll(".reject-btn").forEach(button => {
        button.addEventListener("click", async() => {
            const requestId = button.dataset.id;
            const studentId = button.dataset.student;
            const courseId = button.dataset.course;
            await rejectRequest(requestId, studentId, courseId);
        });
    });
}

// Filter enrollments on change
statusFilter.addEventListener("change", fetchEnrollments);

// Load enrollments on page load
window.onload = fetchEnrollments;