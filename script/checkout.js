import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";


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
const auth = getAuth(app);

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadPayment(courseId);
    } else {
        window.location.href = "login.html";
    }
});

async function loadPayment(courseId) {
    try {
        const titleElement = document.getElementById("course-title");
        const priceElement = document.getElementById("course-price");
        const paypalContainer = document.getElementById("paypal-button-container");

        const courseRef = doc(db, "courses", courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
            console.error("Course not found.");
            return;
        }

        const courseData = courseSnap.data();
        const courseTitle = courseData.title || "Untitled Course";
        const coursePrice = courseData.price || 0;

        titleElement.textContent = courseTitle;
        priceElement.textContent = `Price: $${coursePrice}`;

        if (!paypalContainer.hasChildNodes()) {
            paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: { value: coursePrice.toFixed(2) },
                            description: courseTitle
                        }]
                    });
                },
                onApprove: async(data, actions) => {
                    const order = await actions.order.capture();
                    console.log("Order Details:", order);

                    alert("Payment Successful!");
                    window.location.href = `vidoes.html?courseId=${courseId}`;
                },
                onError: (err) => {
                    console.error("Payment Error:", err);
                    alert("Payment failed. Please try again.");
                }
            }).render("#paypal-button-container");
        }
    } catch (error) {
        console.error("Error fetching course details:", error);
    }
}