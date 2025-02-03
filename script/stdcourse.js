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
                                        <a href="course_details.html?id=${doc.id}" class="wishlist-btn">Enroll</a>
                                        <button class="wishlist-btn" onclick="toggleWishlist('${doc.id}', '${course.title}', '${course.image}', '${course.price}')">
                                            Add to Wishlist
                                        </button>
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

function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}


window.toggleWishlist = function(id, title, image, price) {
    let wishlist = getWishlist();
    let index = wishlist.findIndex(item => item.id === id);

    if (index === -1) {
        wishlist.push({ id, title, image, price });
    }

    saveWishlist(wishlist);
    updateWishlistCount();
    loadWishlistIcons();
};



function loadWishlistIcons() {
    let wishlist = getWishlist();
    document.querySelectorAll(".wishlist-btn").forEach(button => {
        let courseId = button.getAttribute("onclick").match(/'([^']+)'/)[1];
        button.textContent = wishlist.some(item => item.id === courseId) ? "Remove from Wishlist" : "Add to Wishlist";
    });
}


window.viewWishlist = function() {
    let wishlistItems = document.getElementById("wishlist-items");
    let wishlistModal = document.getElementById("wishlist-modal");
    let wishlist = getWishlist();

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = "<p>No items in wishlist.</p>";
    } else {
        wishlistItems.innerHTML = wishlist.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" width="100">
                <p>${item.title} - $${item.price}</p>
                <button onclick="removeFromWishlist('${item.id}')">Remove</button>
                 <button onclick="enrollToCourse('${item.id}')">Enroll</button>
            </div>
        `).join("");
    }

    wishlistModal.style.display = "block";
};


window.enrollToCourse = function(courseId) {
    console.log("Enrolling in course with ID:", courseId);
    removeFromWishlist(courseId);

};

window.removeFromWishlist = function(id) {
    let wishlist = getWishlist().filter(item => item.id !== id);
    saveWishlist(wishlist);
    viewWishlist();
    updateWishlistCount();
    loadWishlistIcons();
};



window.closeWishlist = function() {
    document.getElementById("wishlist-modal").style.display = "none";
};


function updateWishlistCount() {
    let wishlist = getWishlist();
    document.getElementById("wishlist-count").textContent = `(${wishlist.length})`;
}
document.addEventListener("DOMContentLoaded", loadCourses);