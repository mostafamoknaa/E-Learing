import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc
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


async function loadStudents() {
    try {
        const querySnapshot = await getDocs(collection(db, "Completecourse"));

        studentTableBody.innerHTML = "";
        let index = 1;

        const studentCourses = {};

        querySnapshot.forEach((doc) => {
            const student = doc.data();
            const studentId = student.Studentid;
            const courseId = student.Courseid;
            const isFinished = student.Finshed;

            if (!studentCourses[studentId]) {
                studentCourses[studentId] = {
                    completedCourses: [],
                    uncompletedCourses: []
                };
            }

            if (isFinished) {
                studentCourses[studentId].completedCourses.push(courseId);
            } else {
                studentCourses[studentId].uncompletedCourses.push(courseId);
            }
        });

        for (const studentId in studentCourses) {
            const { completedCourses, uncompletedCourses } = studentCourses[studentId];

            const rowSpanCount = Math.max(completedCourses.length, uncompletedCourses.length, 1);

            for (let i = 0; i < rowSpanCount; i++) {
                const row = document.createElement("tr");

                if (i === 0) {
                    row.innerHTML = `
                        <td rowspan="${rowSpanCount}">${index++}</td>
                        <td rowspan="${rowSpanCount}">${studentId}</td>
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