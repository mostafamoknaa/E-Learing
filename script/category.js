import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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


// Get elements
const categoryForm = document.getElementById("category-form");
const categoryNameInput = document.getElementById("category-name");
const categoryList = document.getElementById("category-list");

// Fetch Categories from Firestore
async function fetchCategories() {
    categoryList.innerHTML = "";
    try {
        const snapshot = await getDocs(collection(db, "categories"));
        let index = 1;

        snapshot.forEach(doc => {
            const category = doc.data();
            let tr = document.createElement("tr");

            let td1 = document.createElement("td");
            let td2 = document.createElement("td");
            let td3 = document.createElement("td");
            let td4 = document.createElement("td");

            td1.innerHTML = index++;
            td2.innerHTML = category.name;

            // Delete Button
            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-btn");
            deleteButton.setAttribute("data-id", doc.id);
            deleteButton.onclick = () => deleteCategory(doc.id);

            //update Button
            let updateButton = document.createElement("button");
            updateButton.textContent = "Update";
            updateButton.classList.add("update-btn");
            updateButton.setAttribute("data-id", doc.id);
            updateButton.onclick = () => updateCategory(doc.id);

            td4.appendChild(deleteButton);
            td3.appendChild(updateButton);
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            categoryList.appendChild(tr);
        });
    } catch (error) {
        console.error("Error fetching categories: ", error);
    }
}

// // Add Category to Firestore
categoryForm.addEventListener("submit", async(e) => {
    e.preventDefault();

    const name = categoryNameInput.value.trim();
    const regex = /^[A-Za-z]+$/;
    if (!name || name.length < 3 || !regex.test(name)) {
        alert("Please Enter a valid Category Name");
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "categories"));

        const categoryExists = snapshot.docs.some(doc => doc.data().name.toLowerCase() === name.toLowerCase());

        if (categoryExists) {
            alert("Category already exists");
            return;
        }
        await addDoc(collection(db, "categories"), { name: name });
        alert("Category added successfully");
        categoryNameInput.value = "";
        fetchCategories();

    } catch (e) {
        console.error("Error adding category: ", e);
    }
});


// Delete Category from Firestore
async function deleteCategory(categoryId) {
    try {
        const isConfirmed = confirm("Are you sure you want to delete this Category?");

        if (isConfirmed) {
            await deleteDoc(doc(db, "categories", categoryId));
            fetchCategories();
        } else {
            alert('Deletion canceled.');
        }
    } catch (error) {
        console.error("Error deleting category:", error);
    }
}

async function updateCategory(categoryId) {
    const newName = prompt("Enter the new name for the category:");
    const regex = /^[A-Za-z]+$/;
    if (!newName || newName.length < 3 || !regex.test(newName)) {
        alert("Please Enter a valid Category Name");
        return;
    }
    if (newName) {
        try {
            const categoryRef = doc(db, "categories", categoryId);
            const snapshot = await getDocs(collection(db, "categories"));
            const categoryExists = snapshot.docs.some(doc => doc.data().name.toLowerCase() === newName.toLowerCase());

            if (categoryExists) {
                alert("Category already exists");
                return;
            } else {
                await updateDoc(categoryRef, { name: newName });
                fetchCategories();
                alert("Category updated Successfully");
            }

        } catch (error) {
            console.error("Error updating category:", error);
        }
    }
}

fetchCategories();