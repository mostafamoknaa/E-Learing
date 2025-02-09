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
    serverTimestamp
} from "./module.js";

let currentUser = null;


onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) fetchEnrollments();
});


const registrationTable = document.getElementById("enrollment-table");
const statusFilter = document.getElementById("status-filter");


async function fetchEnrollments() {
    const tableBody = registrationTable.querySelector("tbody");
    tableBody.innerHTML = "";

    const selectedStatus = statusFilter.value.trim();

    try {
        const snapshot = await getDocs(collection(db, "enrollment"));

        for (const docSnap of snapshot.docs) {
            const request = docSnap.data();
            const requestId = docSnap.id;

            if (selectedStatus !== "all" && request.status !== selectedStatus) continue;

            const studentName = await getStudentName(request.userId);
            //console.log("Student:", request.studentId);
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



async function getStudentName(studentId) {
    //console.log("Student ID:", studentId);
    if (!studentId) {
        return "Unknown";
    }

    try {
        const studentRef = doc(db, "student", studentId);
        const studentSnap = await getDoc(studentRef);

        const studentData = studentSnap.data();
        if (!studentSnap.exists() || !studentData.name) {
            return "Unknown Student";
        }

        return studentData.name.trim();
    } catch (error) {
        console.error("Error fetching student name:", error);
        return "Student";
    }
}



async function getCourseTitle(courseId) {
    try {
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        return courseSnap.exists() ? courseSnap.data().title : "Unknown Course";
    } catch (error) {
        console.error("Error fetching course title:", error);
        return "Unknown Course";
    }
}


async function approveRequest(requestId, studentId, courseId) {
    try {
        await updateDoc(doc(db, "enrollment", requestId), { status: "approved" });

        await sendNotification(studentId, `Your enrollment in "${await getCourseTitle(courseId)}" has been approved!`);

        fetchEnrollments();
    } catch (error) {
        console.error("Error approving request:", error);
    }
}


async function rejectRequest(requestId, studentId, courseId) {
    try {
        await updateDoc(doc(db, "enrollment", requestId), { status: "rejected" });

        await sendNotification(studentId, `Your enrollment in "${await getCourseTitle(courseId)}" has been rejected.`);


        fetchEnrollments();
    } catch (error) {
        console.error("Error rejecting request:", error);
    }
}

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




statusFilter.addEventListener("change", fetchEnrollments);


window.onload = fetchEnrollments;