import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

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
const db = getFirestore(app);


const courseForm = document.getElementById("course-form");
const categoryDropdown = document.getElementById("course-category");


async function loadCategories() {
    try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        categoryDropdown.innerHTML = `<option value="">Select a category</option>`;

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


//window.addEventListener("DOMContentLoaded", loadCategories);

loadCategories();


courseForm.addEventListener("submit", async(event) => {
    event.preventDefault();

    const title = document.getElementById("course-title").value.trim();
    const instructor = document.getElementById("course-instructor").value.trim();
    const price = document.getElementById("course-price").value.trim();
    const image = document.getElementById("course-image").value.trim();
    const category = categoryDropdown.value;
    const duration = document.getElementById("course-duration").value.trim();
    const description = document.getElementById("course-description").value.trim();
    const videoUrl = document.getElementById("course-video").value.trim();


    if (!title || !instructor || !price || !image || !category || !duration || !description || !videoUrl) {
        alert("Please fill all fields correctly.");
        return;
    }
    if (!CheckName(title)) {
        alert("Please enter only characters for the title.");
        return;
    }
    if (!CheckName(instructor)) {
        alert("Please enter only characters for the instructor.");
        return;
    }
    if (!checkNumber(price)) {
        alert("Please enter only positive numbers for the price.");
        return;
    }
    if (!checkNumber(duration)) {
        alert("Please enter only positive numbers for the duration.");
        return;
    }

    if (!CheckName(description)) {
        alert("Please enter a only characters for the description.");
        return;
    }
    if (!checkurl(videoUrl)) {
        alert("Please enter a valid video URL.");
        return;
    }
    if (!checkurl(image)) {
        alert("Please enter a valid image URL.");
        return;
    }

    try {

        const docRef = await addDoc(collection(db, "courses"), {
            title,
            instructor,
            price,
            image,
            category,
            duration,
            description,
            videoUrl
        });

        //console.log("Course added with ID:", docRef.id);
        alert("Course added successfully!");


        courseForm.reset();
    } catch (error) {
        console.error("Error adding course:", error.message);
        alert("Failed to add course. Check console for details.");
    }
});

function CheckName(name) {
    const regx = /^[a-zA-Z\s]+[^\s]$/;
    if (name.length < 3 || !regx.test(name)) {
        return false;
    }
    return true;
}

function checkNumber(number) {
    const regx = /^[0-9]+$/;
    if (number.length < 0 || !regx.test(number)) {
        return false;
    }
    return true;
}

function checkurl(url) {
    const regx = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (url.length < 0 || !regx.test(url)) {
        return false;
    }
    return true;
}