import {
    db,
    getDocs,
    collection,
} from "./module.js";

const studentTableBody = document.getElementById("studentTableBody");

// Fetch course names from Firestore
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

// Fetch student names & emails from Firestore
async function getStudentsData() {
    const students = {};
    try {
        const querySnapshot = await getDocs(collection(db, "student"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            students[doc.id] = {
                name: student.name.trim() || "Unknown Student",
                email: student.email || "Unknown Email"
            };
        });
    } catch (error) {
        console.error("Error fetching student data:", error);
    }
    return students;
}

// Load students and their completed courses
async function loadStudents() {
    try {
        const [courseNames, students] = await Promise.all([
            getCourseNames(),
            getStudentsData()
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
                    name: students[studentId].name || "Unknown Student",
                    email: students[studentId].email || "Unknown Email",
                    completedCourses: [],
                };
            }

            if (!isFinished) {
                studentCourses[studentId].completedCourses.push(courseNames[courseId] || "Unknown Course");
            }
        });

        // Render student data
        for (const studentId in studentCourses) {
            const { name, email, completedCourses } = studentCourses[studentId];
            const completedCount = completedCourses.length || 1;

            for (let i = 0; i < completedCount; i++) {
                const row = document.createElement("tr");

                if (i === 0) {
                    row.innerHTML = `
                        <td rowspan="${completedCount}">${index++}</td>
                        <td rowspan="${completedCount}">${name}</td>
                        <td rowspan="${completedCount}">${email}</td>
                        <td>${completedCourses[i] || "No completed courses"}</td>
                    `;
                } else {
                    row.innerHTML = `<td>${completedCourses[i] || ""}</td>`;
                }

                studentTableBody.appendChild(row);
            }
        }
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

// Run on page load
window.addEventListener("DOMContentLoaded", loadStudents);