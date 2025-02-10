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
const feedbackList = document.getElementById("feedback-list");

async function fetchFeedback() {
    try {
        if (!courseId) {
            feedbackList.innerHTML = "<p>Invalid Course ID.</p>";
            return;
        }


        const feedbackRef = collection(db, "feedback");
        const q = query(feedbackRef, where("courseId", "==", courseId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            feedbackList.innerHTML = "<p>No feedback available yet.</p>";
            return;
        }

        feedbackList.innerHTML = "";


        for (const docSnap of querySnapshot.docs) {
            const feedback = docSnap.data();
            const studentName = await getStudentName(feedback.userId);

            const feedbackCard = document.createElement("div");
            feedbackCard.classList.add("feedback-card");

            feedbackCard.innerHTML = `
                <img src="${feedback.userAvatar || 'images/Avatar.png'}" alt="User Avatar" class="user-avatar">
                <div class="feedback-content">
                    <p class="feedback-user">${studentName || "Anonymous"}</p>
                    <p class="rating">${generateStars(feedback.rating)}</p>
                    <p class="feedback-text">${feedback.feedback || "No feedback provided."}</p>
                </div>
            `;

            feedbackList.appendChild(feedbackCard);
        }
    } catch (error) {
        console.error("Error fetching feedback:", error);
        feedbackList.innerHTML = "<p>Error loading feedback.</p>";
    }
}


async function getStudentName(studentId) {
    if (!studentId) return "Unknown";

    try {
        const studentRef = doc(db, "student", studentId);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
            return studentSnap.data().name || "Unknown Student";
        } else {
            return "Unknown Student";
        }
    } catch (error) {
        console.error("Error fetching student name:", error);
        return "Student";
    }
}


function generateStars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}


fetchFeedback();
document.getElementById("logout-btn").addEventListener("click", logout);