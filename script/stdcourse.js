import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, deleteDoc, writeBatch, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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

async function loadCourses() {
    const coursesContainer = document.getElementById("courses-container");
    coursesContainer.innerHTML = "<p>Loading courses...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        coursesContainer.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const course = doc.data();

            const courseHTML = `
                        <div class="col-md-4">
                            <div class="content-box">
                                <img src="${course.image}" alt="${course.title}">
                                <div class="content-info">
                                    <h5>${course.title}</h5>
                                    <p><strong>Instructor:</strong> ${course.instructor}</p>
                                    <p><strong>Price:</strong> $${course.price}</p>
                                    <div class="btn-group">
                                        <a href="course_details.html?id=${doc.id}" class="btn btn-primary">View Course</a>
                                        <button class="btn btn-outline-warning" onclick="addToWishlist('${doc.id}')">Add to Wishlist</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
            coursesContainer.innerHTML += courseHTML;
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
        coursesContainer.innerHTML = "<p>Error loading courses. Please try again.</p>";
    }
}

window.addToWishlist = function(courseId) {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (!wishlist.includes(courseId)) {
        wishlist.push(courseId);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        alert("Added to wishlist!");
    } else {
        alert("Course is already in your wishlist.");
    }
};

document.addEventListener("DOMContentLoaded", loadCourses);