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
    serverTimestamp
} from "./module.js";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        loadCourses();
    }
});


const statusFilter = document.getElementById("status-filter");
async function populateCategoryFilter() {
    try {
        const coursesRef = collection(db, "courses");
        const querySnapshot = await getDocs(coursesRef);

        const categories = new Set();
        querySnapshot.forEach(doc => {
            const course = doc.data();
            if (course.category) {
                categories.add(course.category);
            }
        });

        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            statusFilter.appendChild(option);
        });

        statusFilter.addEventListener("change", () => {
            loadCourses(statusFilter.value);
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}
populateCategoryFilter();

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

searchButton.addEventListener("click", () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    loadCourses();

});




async function loadCourses() {
    const coursesContainer = document.getElementById("courses-container");
    if (!coursesContainer) return;

    coursesContainer.innerHTML = "<p>Loading courses...</p>";

    try {
        let coursesRef = collection(db, "courses");
        let selectedCategory = statusFilter.value;
        let searchTerm = searchInput.value.toLowerCase().trim();

        let q = selectedCategory !== "all" ? query(coursesRef, where("category", "==", selectedCategory)) : coursesRef;
        const querySnapshot = await getDocs(q);

        const coursePromises = querySnapshot.docs.map(async(doc) => {
            const course = doc.data();
            if (
                searchTerm &&
                !course.title.toLowerCase().includes(searchTerm) &&
                !course.instructor.toLowerCase().includes(searchTerm)
            ) {
                return "No Courses Found Matching Your Search ";
            }
            let enrollmentStatus = "not enrolled";
            let enrollmentId = null;

            if (currentUser) {
                const enrollmentRef = collection(db, "enrollment");
                const q = query(
                    enrollmentRef,
                    where("courseId", "==", doc.id),
                    where("userId", "==", currentUser.uid)
                );
                const enrollmentSnapshot = await getDocs(q);

                if (!enrollmentSnapshot.empty) {
                    const enrollmentData = enrollmentSnapshot.docs[0].data();
                    enrollmentStatus = enrollmentData.status;
                    enrollmentId = enrollmentSnapshot.docs[0].id;
                }
            }
            let isPurchased = false;

            if (currentUser) {
                const purchaseRef = collection(db, "purchases");
                const purchaseQuery = query(purchaseRef, where("courseId", "==", doc.id), where("userId", "==", currentUser.uid));
                const purchaseSnapshot = await getDocs(purchaseQuery);

                if (!purchaseSnapshot.empty) {
                    isPurchased = true;
                }
            }

            const buyButtonText = isPurchased ? "View Course" : "Buy Course";
            const buyButtonDisabled = isPurchased ? "disabled" : "";

            const buttonText = enrollmentStatus === "approved" ? "Open Course" :
                enrollmentStatus === "pending" ? "Pending Approval" : "Enroll";

            return `
                <div class="col-md-4">
                    <div class="content-box">
                        <img src="${course.image || ''}" alt="${course.title}" onerror="this.src='default-course-image.jpg'">
                        <div class="content-info">
                            <h5>${course.title}</h5>
                            <p><strong>Instructor:</strong> ${course.instructor}</p>
                            <p><strong>Price:</strong> $${course.price}</p>
                            <div class="btn-group">
                                <button class="enroll-btn" 
                                    data-id="${doc.id}" 
                                    data-enrollment-id="${enrollmentId}" 
                                    ${enrollmentStatus === "pending" ? "disabled" : ""}>
                                    ${buttonText}
                                </button>
                                <button class="buy-course-btn" data-id="${doc.id}">
                                    ${buyButtonText}
                                </button>
                                <button class="wishlist-btn" 
                                    data-id="${doc.id}" 
                                    data-title="${course.title}" 
                                    data-image="${course.image || ''}" 
                                    data-price="${course.price}">
                                    Add to Wishlist
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        const courseElements = await Promise.all(coursePromises);
        coursesContainer.innerHTML = courseElements.join('');

        watchEnrollmentStatus();
        attachEventListeners();
    } catch (error) {
        console.error("Error fetching courses:", error);
        coursesContainer.innerHTML = "<p>Error loading courses. Please try again.</p>";
    }
}

function attachEventListeners() {
    document.querySelectorAll(".enroll-btn").forEach(button => {
        button.addEventListener("click", handleEnrollment);
    });
    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("wishlist-btn")) {
            const { id, title, image, price } = event.target.dataset;
            addWishlist(id, title, image, price);
        }
    });
    document.querySelectorAll(".buy-course-btn").forEach(button => {
        button.addEventListener("click", async(e) => {
            const courseId = e.target.dataset.id;

            if (e.target.textContent.trim() === "View Course") {
                window.location.href = `vidoes.html?courseId=${courseId}`;
            } else {
                window.location.href = `pay.html?courseId=${courseId}`;
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
                window.location.href = `vidoes.html?courseId=${courseId}`;
            } else {
                button.textContent = "Pending Approval";
                button.disabled = true;
            }
        } else {

            await addDoc(enrollmentRef, {
                courseId: courseId,
                userId: currentUser.uid,
                status: "pending"
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




function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function addWishlist(id, title, image, price) {
    let wishlist = getWishlist();
    let index = wishlist.findIndex(item => item.id === id);

    if (index === -1) {
        wishlist.push({ id, title, image, price });
    }

    const button = document.querySelector(`.wishlist-btn[data-id="${id}"]`);
    if (button) {
        button.textContent = "Course Added to Wishlist";
        button.disabled = true;
    }
    saveWishlist(wishlist);
}

function getWishlist() {

    return JSON.parse(localStorage.getItem("wishlist")) || []
}

document.addEventListener("DOMContentLoaded", loadCourses);