import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const studentTableBody = document.getElementById("studentTableBody");

// Function to get all course names
async function getCourseNames() {
    const courseNames = {};
    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        querySnapshot.forEach((doc) => {
            const course = doc.data();
            courseNames[doc.id] = course.title || "Unknown Course"; // Store Course ID as key and Title as value
        });
    } catch (error) {
        console.error("Error fetching course names:", error);
    }
    return courseNames;
}

// Function to get all student names
async function getStudentNames() {
    const studentNames = {};
    try {
        const querySnapshot = await getDocs(collection(db, "student"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            studentNames[student.userId] = student.name || "Unknown Student"; // Store Student ID as key and Name as value
        });
    } catch (error) {
        console.error("Error fetching student names:", error);
    }
    return studentNames;
}

// Function to load students and their courses
async function loadStudents() {
    try {
        const courseNames = await getCourseNames(); // Fetch all course names
        const studentNames = await getStudentNames(); // Fetch all student names
        const querySnapshot = await getDocs(collection(db, "coursecompleted"));

        studentTableBody.innerHTML = "";
        let index = 1;
        const studentCourses = {}; // Store student-wise course data

        // Organize data by student
        querySnapshot.forEach((doc) => {
            const record = doc.data();
            const studentId = record.userId;
            const courseId = record.courseId;
            const isFinished = record.iscompleted;

            if (!studentCourses[studentId]) {
                studentCourses[studentId] = {
                    name: studentNames[studentId] || "Unknown Student",
                    completedCourses: [],
                    uncompletedCourses: []
                };
            }

            const courseName = courseNames[courseId] || "Unknown Course";
            if (isFinished) {
                studentCourses[studentId].completedCourses.push(courseName);
            } else {
                studentCourses[studentId].uncompletedCourses.push(courseName);
            }
        });

        // Render student-course data in table
        for (const studentId in studentCourses) {
            const { name, completedCourses, uncompletedCourses } = studentCourses[studentId];

            const rowSpanCount = Math.max(completedCourses.length, uncompletedCourses.length, 1);

            for (let i = 0; i < rowSpanCount; i++) {
                const row = document.createElement("tr");

                if (i === 0) {
                    row.innerHTML = `
                        <td rowspan="${rowSpanCount}">${index++}</td>
                        <td rowspan="${rowSpanCount}">${name}</td>
                        <td>${completedCourses[i] || "No Completed Courses"}</td>
                        <td>${uncompletedCourses[i] || "No Uncompleted Courses"}</td>
                    `;
                } else {
                    row.innerHTML = `
                        <td>${completedCourses[i] || ""}</td>
                        <td>${uncompletedCourses[i] || ""}</td>
                    `;
                }

                studentTableBody.appendChild(row);
            }
        }
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

// Load students on page load
window.addEventListener("DOMContentLoaded", loadStudents);