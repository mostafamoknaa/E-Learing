import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    addDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase Config
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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;


onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        loadWishlist();
    }
});

function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}


function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function loadWishlist() {
    const wishlist = getWishlist();
    const wishlistContainer = document.getElementById("courses-container");
    if (!wishlistContainer) return;

    wishlistContainer.innerHTML = wishlist.length === 0 ?
        "<p>No items in wishlist.</p>" :
        wishlist.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" width="100">
                <p>${item.title} - $${item.price}</p>
                <button class="wishlist-btn" data-id="${item.id}">Remove</button>
                <button class="enroll-btn" data-id="${item.id}">Enroll</button>
            </div>
        `).join("");

    attachEventListeners();
    watchEnrollmentStatus();
}


function attachEventListeners() {
    document.querySelectorAll(".wishlist-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            removeFromWishlist(event.target.getAttribute("data-id"));
        });
    });

    document.querySelectorAll(".enroll-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            handleEnrollment(event.target.getAttribute("data-id"));
        });
    });
}

function watchEnrollmentStatus() {
    if (!currentUser) return;

    const enrollmentRef = collection(db, "enrollment");
    const q = query(enrollmentRef, where("userId", "==", currentUser.uid));

    onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach(enrollmentDoc => {
            const enrollmentData = enrollmentDoc.data();
            const courseId = enrollmentData.courseId;
            const status = enrollmentData.status;

            const button = document.querySelector(`button[data-id="${courseId}"]`);
            if (button) {
                if (status === "approved") {
                    button.innerText = "Open Course";
                    button.disabled = false;
                    button.addEventListener("click", () => {
                        window.location.href = `vidoes.html?courseId=${courseId}`;
                    });
                } else if (status === "pending") {
                    button.innerText = "Pending Approval";
                    button.disabled = true;
                }
            }
        });
    });
}

async function handleEnrollment(courseId) {
    if (!currentUser) {
        alert("Please log in to enroll in a course.");
        return;
    }

    const button = document.querySelector(`.enroll-btn[data-id="${courseId}"]`);
    if (!button) return;


    // if (["Open Course", "Pending Approval", "Enrolling..."].includes(button.innerText)) return;

    button.innerText = "Enrolling...";
    button.disabled = true;

    try {
        const enrollmentRef = collection(db, "enrollment");
        const q = query(enrollmentRef, where("courseId", "==", courseId), where("userId", "==", currentUser.uid));
        const enrollmentSnapshot = await getDocs(q);

        if (!enrollmentSnapshot.empty) {
            const enrollmentData = enrollmentSnapshot.docs[0].data();

            if (enrollmentData.status === "approved") {
                window.location.href = `videos.html?courseId=${courseId}`;
            } else {
                button.innerText = "Pending Approval";
            }
        } else {
            await addDoc(enrollmentRef, {
                courseId: courseId,
                userId: currentUser.uid,
                status: "pending",

            });

            alert("Enrollment request submitted. Waiting for approval.");
            button.innerText = "Pending Approval";
        }

        button.disabled = true;
    } catch (error) {
        console.error("Error enrolling in course:", error);
        alert("An error occurred while enrolling. Please try again.");
        button.innerText = "Enroll";
        button.disabled = false;
    }
}




window.viewWishlist = function() {
    const wishlist = getWishlist();
    const wishlistItems = document.getElementById("wishlist-items");
    const wishlistModal = document.getElementById("wishlist-modal");

    if (!wishlistModal || !wishlistItems) return;

    wishlistItems.innerHTML = wishlist.length === 0 ?
        "<p>No items in wishlist.</p>" :
        wishlist.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" width="100">
                <p>${item.title} - $${item.price}</p>
                <button class="wishlist-btn" data-id="${item.id}">Remove</button>
                <button class="enroll-btn" data-id="${item.id}">Enroll</button>
            </div>
        `).join("");

    attachEventListeners();
    wishlistModal.style.display = "block";
};


window.closeWishlistModal = function() {
    const wishlistModal = document.getElementById("wishlist-modal");
    if (wishlistModal) wishlistModal.style.display = "none";
};


window.removeFromWishlist = function(id) {
    let wishlist = getWishlist().filter(item => item.id !== id);
    saveWishlist(wishlist);


    loadWishlist();
    viewWishlist();
    updateWishlistCount();
};

function updateWishlistCount() {
    const count = getWishlist().length;
    const wishlistCounter = document.getElementById("wishlist-count");
    if (wishlistCounter) {
        wishlistCounter.textContent = count;
    }
}