import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, addDoc, setDoc, getDocs, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";


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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);








window.onload = function() {

    document.getElementById('Username_sign_up').value = "";
    document.getElementById('Email_sign_up').value = "";
    document.getElementById('password_sign_up').value = "";

}






const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const sign_in_btn2 = document.querySelector("#sign-in-btn2");
const sign_up_btn2 = document.querySelector("#sign-up-btn2");

// Function to validate email format
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// Function to validate username (only letters & spaces)
function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z\s]+$/;
    return usernameRegex.test(username);
}

//  Function to validate password (8-20 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special char)
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return passwordRegex.test(password);
}

sign_up_btn.addEventListener("click", () => {
    container.classList.add("sign-up-mode");
});
sign_in_btn.addEventListener("click", () => {
    container.classList.remove("sign-up-mode");
});
sign_up_btn2.addEventListener("click", () => {
    container.classList.add("sign-up-mode2");
});
sign_in_btn2.addEventListener("click", () => {
    container.classList.remove("sign-up-mode2");
});



document.getElementById('form').addEventListener('submit', async function(event) {


    event.preventDefault();

    let Username_sign_up = document.getElementById('Username_sign_up').value.trim();
    let Email_sign_up = document.getElementById('Email_sign_up').value.trim();
    let password_sign_up = document.getElementById('password_sign_up').value;


    if (!Username_sign_up || !Email_sign_up || !password_sign_up) {
        alert("Please fill in all fields!");
        return;
    }

    //  Validate username
    if (!validateUsername(Username_sign_up)) {
        alert("Username must contain only letters and spaces!");
        return;
    }

    // Validate email
    if (!validateEmail(Email_sign_up)) {
        alert("Invalid email format!");
        return;
    }

    //  Validate password
    if (!validatePassword(password_sign_up)) {
        alert("Password must be 8-20 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character!");
        return;
    }

    //to add the name of the user to the database 


    createUserWithEmailAndPassword(auth, Email_sign_up, password_sign_up)
        .then(async(userCredential) => {
            const user = userCredential.user;
            const userId = user.uid;


            await setDoc(doc(db, "student", userId), {
                name: Username_sign_up,
                email: Email_sign_up
            });

            alert("User signed up successfully!");
            userCredential.user.getIdToken().then((token) => {
                localStorage.setItem("userToken", token);

            });
            window.location.href = "home.html";
        })
        .catch((error) => {
            alert(error.message);
        });


});



// sign in /////
document.getElementById('form_in').addEventListener('submit', async function(event) {

    event.preventDefault();
    let Email_sign_in = document.getElementById('Email_sign_in').value.trim();
    let password_sign_in = document.getElementById('password_sign_in').value;



    if (!Email_sign_in || !password_sign_in) {
        alert("Please fill in all fields!");
        return;
    }

    if (!validateEmail(Email_sign_in)) {
        alert("Invalid email format!");
        return;
    }


    if (!validatePassword(password_sign_in)) {
        alert("Password must be 8-20 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character!");
        return;
    }

    signInWithEmailAndPassword(auth, Email_sign_in, password_sign_in)
        .then((userCredential) => {
            alert("Welcome To out Site!");
            userCredential.user.getIdToken().then((token) => {
                localStorage.setItem("userToken", token);

                // //window.location.href = "index.html";
                // window.location.replace("index.html");
                if (userCredential.user.email === "mostafamokna78@gmail.com") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "home.html";
                }
            });
        })
        .catch((error) => {
            alert(error.message);
        });

});



//for test the token

onAuthStateChanged(auth, (user) => {

    if (user) {

        const userId = user.uid;
        console.log(userId);

        user.getIdToken().then((token) => {
            localStorage.setItem("userToken", token);

        });
    } else {
        localStorage.removeItem("userToken");
        console.log("Not logged in");
    }
});