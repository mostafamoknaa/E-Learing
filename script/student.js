import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";


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


async function getCourseNames() {
    const courseNames = {};
    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        querySnapshot.forEach((doc) => {
            const course = doc.data();
            courseNames[doc.id] = course.title || "Unknown Course";
        });
    } catch (error) {
        console.error("Error fetching course names:", error);
    }
    return courseNames;
}

async function getStudentNames() {
    const studentNames = {};
    try {
        const querySnapshot = await getDocs(collection(db, "student"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            studentNames[doc.id] = student.name.trim() || "Unknown Student";
        });
    } catch (error) {
        console.error("Error fetching student names:", error);
    }
    return studentNames;
}


async function loadStudents() {
    try {

        const [courseNames, studentNames] = await Promise.all([
            getCourseNames(),
            getStudentNames()
        ]);


        const querySnapshot = await getDocs(collection(db, "coursecompleted"));
        studentTableBody.innerHTML = "";

        let index = 1;
        const studentCourses = {};


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


window.addEventListener("DOMContentLoaded", loadStudents);