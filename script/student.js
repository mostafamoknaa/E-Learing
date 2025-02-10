import {
    db,
    getDocs,
    collection,
} from "./module.js";

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


async function getStudentsData() {
    const students = {};
    try {
        const querySnapshot = await getDocs(collection(db, "student"));
        querySnapshot.forEach((doc) => {
            const student = doc.data();
            if (student.email === "mostafamokna78@gmail.com") {
                return;
            }
            students[doc.id] = {

                name: student.name.trim() || "Unknown Student",
                email: student.email || "Unknown Email",
                completedCourses: [],
                enrolledCourses: [],

            };
        });
    } catch (error) {
        console.error("Error fetching student data:", error);
    }
    return students;
}


async function loadStudents() {
    try {
        const [courseNames, students] = await Promise.all([
            getCourseNames(),
            getStudentsData()
        ]);

        const enrollQuerySnapshot = await getDocs(collection(db, "enrollment"));
        enrollQuerySnapshot.forEach((doc) => {
            const enroll = doc.data();
            const studentId = enroll.userId;
            const courseId = enroll.courseId;

            if (students[studentId]) {
                students[studentId].enrolledCourses.push(courseNames[courseId] || "Unknown Course");
            }
        });


        const querySnapshot = await getDocs(collection(db, "coursecompleted"));
        querySnapshot.forEach((doc) => {
            const record = doc.data();
            const studentId = record.userId;
            const courseId = record.courseId;
            const isFinished = record.iscompleted;

            if (students[studentId] && !isFinished) {
                students[studentId].completedCourses.push(courseNames[courseId] || "Unknown Course");
            }
        });


        studentTableBody.innerHTML = "";
        let index = 1;

        for (const studentId in students) {
            const { name, email, completedCourses, enrolledCourses } = students[studentId];


            const rowCount = Math.max(completedCourses.length, enrolledCourses.length, 1);

            for (let i = 0; i < rowCount; i++) {
                const row = document.createElement("tr");

                if (i === 0) {
                    row.innerHTML = `
                        <td rowspan="${rowCount}">${index++}</td>
                        <td rowspan="${rowCount}">${name}</td>
                        <td rowspan="${rowCount}">${email}</td>
                        <td>${completedCourses[i] || "No Completed courses"}</td>
                        <td>${enrolledCourses[i] || "No Enrolled courses"}</td>
                    `;
                } else {
                    row.innerHTML = `
                        <td>${completedCourses[i] || ""}</td>
                        <td>${enrolledCourses[i] || ""}</td>
                    `;
                }

                studentTableBody.appendChild(row);
            }
        };
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

window.addEventListener("DOMContentLoaded", loadStudents);