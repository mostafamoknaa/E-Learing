import { limit }
from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
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

const courseList = document.querySelector(".course-list");

async function fetchCourses() {
    try {

        const select = query(collection(db, "courses"), limit(4));
        const querySnapshot = await getDocs(select);

        courseList.innerHTML = "";

        querySnapshot.forEach((docSnap) => {
            const course = docSnap.data();
            const courseCard = document.createElement("div");
            courseCard.classList.add("course-card");

            courseCard.innerHTML = `
                <img src="${course.image}" alt="${course.title}">
                <h3>${course.title}</h3>
                
            `;
            courseList.appendChild(courseCard);
            courseCard.addEventListener('click', function() {});

        });

    } catch (error) {
        console.error("Error fetching courses:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchCourses);
document.getElementById("logout-btn").addEventListener("click", logout);