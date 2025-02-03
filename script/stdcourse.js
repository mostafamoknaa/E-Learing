import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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
const coursesList = document.getElementById("courses");
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    loadCourses();
});


async function loadCourses() {
    const coursesContainer = document.getElementById("courses-container");
    coursesContainer.innerHTML = "<p>Loading courses...</p>";

    try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        coursesContainer.innerHTML = "";

        querySnapshot.forEach(async(doc) => {
            const course = doc.data();
            let enrollmentStatus = "not enrolled";
            let enrollmentId = null;

            if (currentUser) {
                const enrollmentRef = collection(db, "enrollment");
                const q = query(enrollmentRef, where("courseId", "==", doc.id), where("userId", "==", currentUser.uid));
                const enrollmentSnapshot = await getDocs(q);

                if (!enrollmentSnapshot.empty) {
                    const enrollmentData = enrollmentSnapshot.docs[0].data();
                    enrollmentStatus = enrollmentData.status;
                    enrollmentId = enrollmentSnapshot.docs[0].id;
                }
            }

            let buttonText = "Enroll";
            if (enrollmentStatus === "approved") {
                buttonText = "Open Course";
            } else if (enrollmentStatus === "pending") {
                buttonText = "Pending Approval";
            }

            const courseHTML = `
                <div class="col-md-4">
                    <div class="content-box">
                        <img src="${course.image}" alt="${course.title}">
                        <div class="content-info">
                            <h5>${course.title}</h5>
                            <p><strong>Instructor:</strong> ${course.instructor}</p>
                            <p><strong>Price:</strong> $${course.price}</p>
                            <div class="btn-group">
                                <button class="enroll-btn" class="wishlist-btn" data-id="${doc.id}" data-enrollment-id="${enrollmentId}" ${enrollmentStatus === "pending" ? "disabled" : ""}>${buttonText}</button>
                                <button class="wishlist-btn" data-id="${doc.id}" data-title="${course.title}" data-image="${course.image}" data-price="${course.price}">
                                    Add to Wishlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            coursesContainer.innerHTML += courseHTML;
        });

        setTimeout(() => {
            document.querySelectorAll(".enroll-btn").forEach(button => {
                button.addEventListener("click", handleEnrollment);
            });
            document.querySelectorAll(".wishlist-btn").forEach(button => {
                button.addEventListener("click", (event) => {
                    const { id, title, image, price } = event.target.dataset;
                    toggleWishlist(id, title, image, price);
                });
            });
        }, 500);

        watchEnrollmentStatus();
    } catch (error) {
        console.error("Error fetching courses:", error);
        coursesContainer.innerHTML = "<p>Error loading courses. Please try again.</p>";
    }
}

window.enrollToCourse = function(courseId) {
    document.querySelector(`button[data-id="${courseId}"]`).click();
    removeFromWishlist(courseId);
};


async function handleEnrollment(event) {
    if (!currentUser) {
        alert("Please log in to enroll in a course.");
        return;
    }

    const courseId = event.target.getAttribute("data-id");

    const enrollmentRef = collection(db, "enrollment");
    const q = query(enrollmentRef, where("courseId", "==", courseId), where("userId", "==", currentUser.uid));
    const enrollmentSnapshot = await getDocs(q);

    if (!enrollmentSnapshot.empty) {
        const enrollmentData = enrollmentSnapshot.docs[0].data();
        if (enrollmentData.status === "approved") {
            window.location.href = `courseContent.html?courseId=${courseId}`;
        } else {
            alert("Your enrollment request is pending approval.");
        }
    } else {
        try {
            await addDoc(enrollmentRef, {
                courseId: courseId,
                userId: currentUser.uid,
                status: "pending"
            });

            alert("Enrollment request submitted. Waiting for approval.");
        } catch (error) {
            console.error("Error enrolling in course:", error);
        }
    }
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
                        window.location.href = `courseContent.html?courseId=${courseId}`;
                    });
                } else if (status === "pending") {
                    button.innerText = "Pending Approval";
                    button.disabled = true;
                }
            }
        });
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
                <button onclick="removeFromWishlist('${item.id}')" class="wishlist-btn">Remove</button>
                 <button onclick="enrollToCourse('${item.id}')" class="wishlist-btn">Enroll</button>
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