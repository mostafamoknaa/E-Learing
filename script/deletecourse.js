import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    deleteDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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



async function getCategoryName(categoryId) {
    if (!categoryId) {
        console.error("No category ID provided!");
        return "Unknown Category";
    }

    try {
        console.log(`Fetching category for ID: ${categoryId}`);


        const categoryRef = doc(db, "categories", categoryId);
        const categorySnap = await getDoc(categoryRef);


        if (categorySnap.exists()) {
            const categoryName = categorySnap.data().name;
            console.log(`Category name fetched: ${categoryName}`);
            return categoryName;
        } else {
            console.warn(`Category not found for ID: ${categoryId}`);
            return "Unknown Category";
        }
    } catch (error) {

        if (error instanceof Error) {
            console.error("Error fetching category:", error.message);
        } else {
            console.error("Error fetching category:", JSON.stringify(error));
        }
        return "Unknown Category";
    }
}

const statusFilter = document.getElementById("status-filter");
const searchInput = document.getElementById("search-input");


async function fetchCourses() {
    const tableBody = document.querySelector("#course-table tbody");
    tableBody.innerHTML = "";

    try {
        const snapshot = await getDocs(collection(db, "courses"));
        const selectedStatus = statusFilter.value;

        for (const [index, docData] of snapshot.docs.entries()) {
            const course = docData.data();


            const categoryName = await getCategoryName(course.category);

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
                </tr>
            `;
            tableBody.innerHTML += row;
        }

        attachDeleteListeners();
        attachEditListeners();
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
            }
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