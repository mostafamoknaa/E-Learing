import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBckLKiCtLIFvXX3SLfyCaszC-vFDL3JA",
    authDomain: "ecommerce-9d94f.firebaseapp.com",
    projectId: "ecommerce-9d94f",
    storageBucket: "ecommerce-9d94f.firebasestorage.app",
    messagingSenderId: "444404014366",
    appId: "1:444404014366:web:d1e5a5f10e5b90ca95fd0f",
    measurementId: "G-V7Q9HY61C5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Select elements
const courseForm = document.getElementById("course-form");
const categoryDropdown = document.getElementById("course-category");

// Categories
async function loadCategories() {
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        categoryDropdown.innerHTML = `<option value="">Select a category</option>`;

        querySnapshot.forEach((doc) => {
            const category = doc.data().name;
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categoryDropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

// Load categories when the page loads
//window.addEventListener("DOMContentLoaded", loadCategories);

loadCategories();

// Handle Course Submission
courseForm.addEventListener("submit", async(event) => {
    event.preventDefault();

    const title = document.getElementById("course-title").value.trim();
    const instructor = document.getElementById("course-instructor").value.trim();
    const price = document.getElementById("course-price").value.trim();
    const image = document.getElementById("course-image").value.trim();
    const category = categoryDropdown.value;
    const duration = document.getElementById("course-duration").value.trim();
    const description = document.getElementById("course-description").value.trim();
    const videoUrl = document.getElementById("course-video").value.trim();

    // Validation Check
    if (!title || !instructor || !price || !image || !category || !duration || !description || !videoUrl) {
        alert("Please fill all fields correctly.");
        return;
    }

    try {
        // Add course to Firestore
        const docRef = await addDoc(collection(db, "courses"), {
            title,
            instructor,
            price,
            image,
            category,
            duration,
            description,
            videoUrl
        });

        //console.log("Course added with ID:", docRef.id);
        alert("Course added successfully!");

        // Reset Form Fields
        courseForm.reset();
    } catch (error) {
        console.error("Error adding course:", error.message);
        alert("Failed to add course. Check console for details.");
    }
});