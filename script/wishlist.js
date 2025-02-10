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
    logout
} from "./module.js";


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

async function loadWishlist() {
    const wishlist = getWishlist();
    const wishlistContainer = document.getElementById("courses-container");
    if (!wishlistContainer) return;

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = "<p>No items in wishlist.</p>";
        return;
    }

    const coursesRef = collection(db, "courses");
    const querySnapshot = await getDocs(coursesRef);

    let userEnrollments = {};
    if (currentUser) {
        const enrollmentRef = collection(db, "enrollment");
        const q = query(enrollmentRef, where("userId", "==", currentUser.uid));
        const enrollmentSnapshot = await getDocs(q);

        userEnrollments = Object.fromEntries(
            enrollmentSnapshot.docs.map(doc => [doc.data().courseId, {
                status: doc.data().status,
                id: doc.id
            }])
        );
    }

    wishlistContainer.innerHTML = wishlist.map(item => {
        const enrollment = userEnrollments[item.id] || { status: "not enrolled", id: null };
        const buttonText = enrollment.status === "approved" ? "Open Course" :
            enrollment.status === "pending" ? "Pending Approval" :
            "Enroll";
        const disabled = enrollment.status === "pending" ? "disabled" : "";

        return `
            <div class="wishlist-item">
                <img src="${item.image}" width="100">
                <p>${item.title} - $${item.price}</p>
                <button class="wishlist-btn" data-id="${item.id}">Remove</button>
                <button class="enroll-btn" data-id="${item.id}" data-enrollment-id="${enrollment.id}" ${disabled}>
                    ${buttonText}
                </button>
            </div>`;
    }).join("");

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
        button.addEventListener("click", handleEnrollment);
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
async function handleEnrollment(event) {
    if (!currentUser) {
        alert("Please log in to enroll in a course.");
        return;
    }

    const button = event.target;
    const courseId = button.getAttribute("data-id");

    try {
        const enrollmentRef = collection(db, "enrollment");
        const q = query(enrollmentRef, where("courseId", "==", courseId), where("userId", "==", currentUser.uid));
        const enrollmentSnapshot = await getDocs(q);

        if (!enrollmentSnapshot.empty) {
            const enrollmentData = enrollmentSnapshot.docs[0].data();
            if (enrollmentData.status === "approved") {
                window.location.href = `videos.html?courseId=${courseId}`;
            } else {
                button.textContent = "Pending Approval";
                button.disabled = true;
            }
        } else {
            console.log("Adding enrollment:", { courseId, userId: currentUser.uid });

            await addDoc(enrollmentRef, {
                courseId: courseId,
                userId: currentUser.uid,
                status: "pending",
            });

            alert("Enrollment request submitted. Waiting for approval.");
            button.textContent = "Pending Approval";
            button.disabled = true;
        }
    } catch (error) {
        console.error("Error enrolling in course:", error);
        alert("An error occurred while enrolling. Please try again.");
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




window.removeFromWishlist = function(id) {
    let wishlist = getWishlist().filter(item => item.id !== id);
    saveWishlist(wishlist);
    loadWishlist();
    viewWishlist();
};

document.getElementById("logout-btn").addEventListener("click", logout);