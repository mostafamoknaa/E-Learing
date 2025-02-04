import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCBckLKiCtLIFvXX3SLfyCaszC-vFDL3JA",
    authDomain: "ecommerce-9d94f.firebaseapp.com",
    projectId: "ecommerce-9d94f",
    storageBucket: "ecommerce-9d94f.appspot.com",
    messagingSenderId: "444404014366",
    appId: "1:444404014366:web:d1e5a5f10e5b90ca95fd0f",
    measurementId: "G-V7Q9HY61C5"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

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

async function fetchCourses() {
    const snapshot = await getDocs(collection(db, "courses"));
    const courseList = document.getElementById("course-list");
    const categoryFilter = document.getElementById("category-filter");

    courseList.innerHTML = "";
    let categories = new Set();
    let coursesData = [];

    for (const docData of snapshot.docs) {
        const course = docData.data();
        course.id = docData.id;
        coursesData.push(course);
        categories.add(course.category);
    }

    for (const course of coursesData) {
        const categoryName = await getCategoryName(course.category);
        let card = `
            <div class="course-card" data-category="${course.category}" data-price="${course.price}" data-duration="${course.duration}">
                <img src="${course.image}" alt="${course.title}" width="200" height="200">  
                <h3>${course.title}</h3>
                <p>Instructor: ${course.instructor}</p>
                <p>Category: ${categoryName}</p>
                <p>Price: $${course.price}</p>
                <p>Duration: ${course.duration} hrs</p>
                <button class="wishlist-btn" data-id="${course.id}" onclick="toggleWishlist('${course.id}', '${course.title}', '${course.image}', '${course.price}')">
                    Add to Wishlist
                </button>
            </div>`;
        courseList.innerHTML += card;
    }

    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(category => {
        let option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });


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
    const wishlist = getWishlist();
    document.querySelectorAll(".wishlist-btn").forEach(button => {
        const courseId = button.dataset.id;
        button.textContent = wishlist.some(item => item.id === courseId) ?
            "View Wishlist" :
            "Add to Wishlist";
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
    updateWishlistCount();
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

window.onload = fetchCourses;