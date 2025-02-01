import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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


const registrationTable = document.getElementById("enrollment-table");
const statusFilter = document.getElementById("status-filter");


async function fetchEnrollments() {
    const tableBody = document.querySelector("#enrollment-table tbody");
    tableBody.innerHTML = "";

    const selectedStatus = statusFilter.value;

    try {
        const snapshot = await getDocs(collection(db, "enrollment"));

        for (const docSnap of snapshot.docs) {
            const request = docSnap.data();
            const requestId = docSnap.id;


            if (selectedStatus !== "all" && request.status !== selectedStatus) {
                continue;
            }

            const row = `
                <tr>
                    <td>${request.studentId}</td>
                    <td>${request.courseId}</td>
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


statusFilter.addEventListener("change", fetchEnrollments);



async function getStudentName(studentId) {
    try {
        const studentRef = doc(db, "users", studentId);
        const studentSnap = await getDoc(studentRef);
        return studentSnap.exists() ? studentSnap.data().name : "Unknown Student";
    } catch (error) {
        console.error("Error fetching student name:", error);
        return "Unknown Student";
    }
}

async function getCourseDetails(courseId) {
    try {
        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);
        return courseSnap.exists() ? courseSnap.data() : { title: "Unknown Course" };
    } catch (error) {
        console.error("Error fetching course details:", error);
        return { title: "Unknown Course" };
    }
}


async function approveRequest(requestId, studentId, courseId) {
    try {
        const requestRef = doc(db, "enrollment", requestId);
        await updateDoc(requestRef, { status: "approved" });

        await sendNotification(studentId, `Your enrollment in "${await getCourseTitle(courseId)}" has been approved!`);

        alert("Enrollment approved!");
        fetchEnrollments();
    } catch (error) {
        console.error("Error approving request:", error);
    }
}


async function rejectRequest(requestId, studentId, courseId) {
    try {
        //await deleteDoc(doc(db, "enrollment", requestId));
        const requestRef = doc(db, "enrollment", requestId);
        await updateDoc(requestRef, { status: "rejected" });

        await sendNotification(studentId, `Your enrollment in "${await getCourseTitle(courseId)}" has been rejected.`);

        alert("Enrollment rejected!");
        fetchEnrollments();
    } catch (error) {
        console.error("Error rejecting request:", error);
    }
}


async function getCourseTitle(courseId) {
    const course = await getCourseDetails(courseId);
    return course.title;
}




function attachEventListeners() {
    document.querySelectorAll(".approve-btn").forEach(button => {
        button.addEventListener("click", async() => {
            const requestId = button.getAttribute("data-id");
            const studentId = button.getAttribute("data-student");
            const courseId = button.getAttribute("data-course");
            await approveRequest(requestId, studentId, courseId);
        });
    });

    document.querySelectorAll(".reject-btn").forEach(button => {
        button.addEventListener("click", async() => {
            const requestId = button.getAttribute("data-id");
            const studentId = button.getAttribute("data-student");
            const courseId = button.getAttribute("data-course");
            await rejectRequest(requestId, studentId, courseId);
        });
    });
}

window.onload = fetchEnrollments;