import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Get category name from Firestore
async function getCategoryName(categoryId) {
    if (!categoryId) return "Unknown Category";

    try {
        const categoryRef = doc(db, "categories", categoryId);
        const categorySnap = await getDoc(categoryRef);

        return categorySnap.exists() ? categorySnap.data().name : "Unknown Category";
    } catch (error) {
        console.error("Error fetching category:", error);
        return "Unknown Category";
    }
}

// Fetch courses and display them
async function fetchCourses() {
    const snapshot = await getDocs(collection(db, "courses"));
    const courseList = document.getElementById("course-list");
    const categoryFilter = document.getElementById("category-filter");

    courseList.innerHTML = "";
    let categories = new Set();

    for (const docData of snapshot.docs) {
        const course = docData.data();
        categories.add(course.category);

        const categoryName = await getCategoryName(course.category);

        let card = `
            <div class="course-card" data-category="${course.category}" data-price="${course.price}" data-duration="${course.duration}">
                <img src="${course.image}" alt="${course.title}">
                <h3>${course.title}</h3>
                <p>Instructor: ${course.instructor}</p>
                <p>Category: ${course.category}</p>
                <p>Price: $${course.price}</p>
                <p>Duration: ${course.duration} hrs</p>
                <button class="wishlist-btn" onclick="toggleWishlist('${docData.id}', '${course.title}', '${course.image}', '${course.price}')">
                    Add to Wishlist
                </button>
            </div>`;
        courseList.innerHTML += card;
    }

    // Populate category filter dropdown
    categories.forEach(category => {
        let option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    loadWishlistIcons();
}

// Load Wishlist from Local Storage
function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

// Save Wishlist to Local Storage
function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// Wishlist (Add/Remove)
window.toggleWishlist = function(id, title, image, price) {
    let wishlist = getWishlist();
    let index = wishlist.findIndex(item => item.id === id);

    if (index === -1) {
        wishlist.push({ id, title, image, price });
    } else {
        wishlist.splice(index, 1);
    }

    saveWishlist(wishlist);
    loadWishlistIcons();
};

// Load Wishlist Icons
function loadWishlistIcons() {
    let wishlist = getWishlist();
    document.querySelectorAll(".wishlist-btn").forEach(button => {
        let courseId = button.getAttribute("onclick").match(/'([^']+)'/)[1];
        button.textContent = wishlist.some(item => item.id === courseId) ? "Remove from Wishlist" : "Add to Wishlist";
    });
}

// View Wishlist
window.viewWishlist = function() {
    let wishlistItems = document.getElementById("wishlist-items");
    let wishlist = getWishlist();

    if (wishlist.length === 0) {
        wishlistItems.innerHTML = "<p>No items in wishlist.</p>";
    } else {
        wishlistItems.innerHTML = wishlist.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" width="100">
                <p>${item.title} - $${item.price}</p>
                <button onclick="removeFromWishlist('${item.id}')">Remove</button>
            </div>
        `).join("");
    }

    document.getElementById("wishlist-modal").style.display = "flex";
};

// Remove from Wishlist
window.removeFromWishlist = function(id) {
    let wishlist = getWishlist().filter(item => item.id !== id);
    saveWishlist(wishlist);
    viewWishlist();
    loadWishlistIcons();
};

// Close Wishlist Modal
window.closeWishlist = function() {
    document.getElementById("wishlist-modal").style.display = "none";
};

// Apply Filters
window.applyFilters = function() {
    let searchQuery = document.getElementById("search-bar").value.toLowerCase();
    let category = document.getElementById("category-filter").value;
    let sortBy = document.getElementById("sort-filter").value;
    let courses = document.querySelectorAll(".course-card");

    courses.forEach(course => {
        let title = course.querySelector("h3").textContent.toLowerCase();
        let courseCategory = course.dataset.category;
        let price = parseFloat(course.dataset.price);
        let duration = parseFloat(course.dataset.duration);

        let show = (title.includes(searchQuery) || searchQuery === "") && (category === "all" || courseCategory === category);
        course.style.display = show ? "block" : "none";
    });

    loadWishlistIcons();
};

// Load courses on page load
window.onload = fetchCourses;