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



const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

function searchCourses() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#course-table tbody tr");

    rows.forEach((row) => {
        const courseTitle = row.querySelector("td:nth-child(2)").textContent.toLowerCase();
        row.style.display = courseTitle.includes(searchTerm) ? "" : "none";
    });
}

searchButton.addEventListener("click", searchCourses);
searchInput.addEventListener("input", searchCourses);





async function fetchCourses() {
    const tableBody = document.querySelector("#course-table tbody");
    tableBody.innerHTML = "";

    try {
        const snapshot = await getDocs(collection(db, "courses"));

        for (const [index, docData] of snapshot.docs.entries()) {
            const course = docData.data();

            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${course.title}</td>
                    <td><img src="${course.image}" width="50"></td>
                    <td>${course.category}</td>
                    <td>${course.instructor}</td>
                    <td>${course.description}</td>
                    <td>$${course.price}</td>
                    <td>${course.duration} hrs</td>
                    <td><button class="edit-btn" data-id="${docData.id}">Edit</button></td>
                    <td><button class="delete-btn" data-id="${docData.id}">Delete</button></td>
                    <td><button class="feedback-btn" data-id="${docData.id}">Feedback</button></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        }

        attachDeleteListeners();
        attachEditListeners();
        attachFeedbackListeners();
    } catch (error) {
        console.error("Error fetching courses:", error);
    }
}




function attachDeleteListeners() {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async() => {
            const courseId = button.getAttribute("data-id");
            if (confirm(`Are you sure you want to delete this course?`)) {
                try {
                    await deleteDoc(doc(db, "courses", courseId));
                    alert("Course deleted successfully!");
                    fetchCourses();
                } catch (error) {
                    console.error("Error deleting course:", error);
                }
            }
        });
    });
}


function attachEditListeners() {
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", async() => {
            const courseId = button.getAttribute("data-id");
            document.getElementById("update-form").style.display = "block";
            document.getElementById("course-id").value = courseId;


            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
                const course = courseSnap.data();
                document.getElementById("course-title").value = course.title;
                document.getElementById("course-image").value = course.image;
                document.getElementById("course-instructor").value = course.instructor;
                document.getElementById("course-category").value = course.category;
                document.getElementById("course-description").value = course.description;
                document.getElementById("course-price").value = course.price;
                document.getElementById("course-duration").value = course.duration;
                document.getElementById("course-video").value = course.videoUrl;
            }
        });
    });
}




function attachFeedbackListeners() {
    document.querySelectorAll(".feedback-btn").forEach(button => {
        button.addEventListener("click", async() => {
            const courseId = button.getAttribute("data-id");
            window.location.href = `feedback.html?courseId=${courseId}`;
        });

    });
}


const courseForm = document.getElementById("course-form");
const categoryDropdown = document.getElementById("course-category");


async function loadCategories() {
    try {

        const querySnapshot = await getDocs(collection(db, "categories"));
        categoryDropdown.innerHTML += `<option value="">Select a category</option>`;

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


document.getElementById("save-update").addEventListener("click", async() => {
    const courseId = document.getElementById("course-id").value;
    if (!courseId) return;

    const updatedData = {
        title: document.getElementById("course-title").value,
        image: document.getElementById("course-image").value,
        instructor: document.getElementById("course-instructor").value,
        category: document.getElementById("course-category").value,
        description: document.getElementById("course-description").value,
        price: parseFloat(document.getElementById("course-price").value),
        duration: parseInt(document.getElementById("course-duration").value),
        videoUrl: document.getElementById("course-video").value,
    };

    try {
        await updateDoc(doc(db, "courses", courseId), updatedData);
        alert("Course updated successfully!");
        document.getElementById("update-form").style.display = "none";
        fetchCourses();
    } catch (error) {
        console.error("Error updating course:", error);
    }
});


fetchCourses();