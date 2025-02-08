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

        paypal.Buttons({
            createOrder: function(data, actions) {
                const amount = document.getElementById('amount').value;
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: coursePrice },
                        description: courseTitle
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    const transaction = details.purchase_units[0].payments.captures[0];
                    alert('Transaction completed by ' + details.payer.name.given_name);
                    simulatePaymentAPI(details);
                    alert("Payment done");
                });
            }
        }).render('#paypal-button-container');

        // Simulate Payment API Request
        function simulatePaymentAPI(paymentDetails) {
            fetch('https://jsonplaceholder.typicode.com/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        transactionId: paymentDetails.id,
                        payerName: paymentDetails.payer.name.given_name,
                        amount: paymentDetails.purchase_units[0].amount.value
                    })
                })
                .then(response => response.json())
                .then(data => console.log('Payment Simulation Successful:', data))
                .catch(error => console.error('Error:', error));
        }
    } catch (error) {
        console.error("Error fetching course details:", error);
    }
}