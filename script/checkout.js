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

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadPayment(courseId);
    } else {
        window.location.href = "login.html";
    }
});



const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

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

        titleElement.textContent = `Course : ${courseTitle}`;
        priceElement.textContent = `Price : $${coursePrice}`;
    } catch (error) {
        console.error("Error fetching course details:", error);
    }
}

const STRIPE_PUBLIC_KEY = "pk_test_51Oa1apC2Y3Ne3oUhz8quAdzU0O1aAgoTSP0wwiEMbUqZDd0knNgOnMSyU3Us4s05QjCdwvqmxA2EDGAT3Mj9a3kj00BKiR5q83";


const stripe = Stripe(STRIPE_PUBLIC_KEY);
const elements = stripe.elements();


const card = elements.create("card");
card.mount("#card-element");


const form = document.getElementById("payment-form");
const paymentMessage = document.getElementById("payment-message");

form.addEventListener("submit", async(event) => {
    event.preventDefault();
    paymentMessage.textContent = "Processing payment...";
    const {
        paymentMethod,
        error
    } = await stripe.createPaymentMethod({
        type: "card",
        card: card,
    });

    if (error) {
        paymentMessage.textContent = "Error: " + error.message;
    } else {
        paymentMessage.textContent = "✅ Payment Successful!";
        await savePurchase(auth.currentUser.uid, courseId);
        window.location.href = `vidoes.html?courseId=${courseId}`;
    }
});

async function savePurchase(userId, courseId) {
    const purchaseRef = collection(db, "purchases");
    await addDoc(purchaseRef, {
        userId,
        courseId,
    });

    const button = document.querySelector(`.buy-course-btn[data-id="${courseId}"]`);
    if (button) {
        button.textContent = "View Course";
        button.disabled = false;
        button.addEventListener("click", () => {
            window.location.href = `vidoes.html?courseId=${courseId}`;
        });
    }
}