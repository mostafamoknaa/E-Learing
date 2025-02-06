import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import {
    getFirestore,
    doc,
    onSnapshot,
    addDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        loadCourseContent();
    } else {
        alert("Please log in to view the course.");
        window.location.href = "index.html";
    }
});

const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get("courseId");

async function loadCourseContent() {
    if (!courseId) {
        alert("Invalid Course!");
        window.location.href = "index.html";
        return;
    }

    const courseRef = doc(db, "courses", courseId);

    onSnapshot(courseRef, (docSnap) => {
        if (docSnap.exists()) {
            const course = docSnap.data();
            document.getElementById("courseTitle").innerText = course.title;
            document.getElementById("courseDuration").innerText = course.duration;
            document.getElementById("courseImage").src = course.image;
            document.getElementById("courseInstructor").innerText = course.instructor;
            document.getElementById("coursePrice").innerText = course.price;
            document.getElementById("courseDescription").innerText = course.description;

            const videoContainer = document.getElementById("videoContainer");

            if (!course.content || course.content.length === 0) {
                videoContainer.innerHTML = "<p class='no-content'>No videos available for this course.</p>";
            } else {
                videoContainer.innerHTML = "";
                course.content.forEach(videoUrl => {
                    if (videoUrl.trim()) {
                        const iframe = document.createElement("iframe");
                        iframe.src = videoUrl.trim();
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.allowFullscreen = true;
                        videoContainer.appendChild(iframe);
                    }
                });
            }

            let myDiv = document.getElementById("myDiv");
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.name = "courseCompleted";
            checkbox.id = "completionCheckbox";

            let label = document.createElement('label');
            label.htmlFor = "completionCheckbox";
            label.appendChild(document.createTextNode('Are you completed the course?'));

            myDiv.appendChild(checkbox);
            myDiv.appendChild(label);

            checkbox.addEventListener("change", async function() {
                if (!currentUser) {
                    alert("Please log in to complete the course.");
                    return;
                }

                const q = query(
                    collection(db, "coursecompleted"),
                    where("courseId", "==", courseId),
                    where("userId", "==", currentUser.uid)
                );

                try {
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const docRef = doc(db, "coursecompleted", querySnapshot.docs[0].id);
                        await updateDoc(docRef, { isCompleted: this.checked });
                    } else {
                        await addDoc(collection(db, "coursecompleted"), {
                            courseId: courseId,
                            userId: currentUser.uid,
                            isCompleted: this.checked
                        });
                        console.log("Course completion recorded!");
                    }

                    // Disable the checkbox after it is checked
                    if (this.checked) {
                        this.disabled = true;
                        // Update the label text
                        label.textContent = 'Course Completed!';
                    }

                } catch (error) {
                    console.error("Error saving course completion:", error);
                }
            });

            // Load the checkbox state from Firestore
            async function loadCheckboxState() {
                if (!currentUser) return;

                const q = query(
                    collection(db, "coursecompleted"),
                    where("courseId", "==", courseId),
                    where("userId", "==", currentUser.uid)
                );

                try {
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const docData = querySnapshot.docs[0].data();
                        const isCompleted = docData.isCompleted;

                        // Set the checkbox state based on Firestore data
                        checkbox.checked = isCompleted;

                        // Disable the checkbox and update the label if the course is completed
                        if (isCompleted) {
                            checkbox.disabled = true;
                            label.textContent = 'Course Completed!';
                        }
                    }
                } catch (error) {
                    console.error("Error loading checkbox state:", error);
                }
            }
            loadCheckboxState();
            // Add feedback and rating functionality


            const feedbackText = document.getElementById("feedbackText");
            const starRating = document.getElementById("starRating");
            const stars = starRating.querySelectorAll(".star");
            const submitFeedbackButton = document.getElementById("submitFeedback");

            let selectedRating = 0;

            // Star rating logic
            stars.forEach(star => {
                star.addEventListener("click", () => {
                    selectedRating = parseInt(star.getAttribute("data-value"));
                    stars.forEach(s => {
                        if (parseInt(s.getAttribute("data-value")) <= selectedRating) {
                            s.classList.add("selected");
                        } else {
                            s.classList.remove("selected");
                        }
                    });
                });
            });


            submitFeedbackButton.addEventListener("click", async() => {
                if (!currentUser) {
                    alert("Please log in to submit feedback.");
                    return;
                }

                const feedback = feedbackText.value.trim();
                if (!feedback || selectedRating === 0) {
                    alert("Please provide feedback and select a rating.");
                    return;
                }

                try {

                    await addDoc(collection(db, "feedback"), {
                        userId: currentUser.uid,
                        courseId: courseId,
                        feedback: feedback,
                        rating: selectedRating,
                        timestamp: new Date()
                    });

                    alert("Thank you for your feedback!");
                    feedbackText.value = "";
                    stars.forEach(star => star.classList.remove("selected"));
                    selectedRating = 0;
                } catch (error) {
                    console.error("Error submitting feedback:", error);
                    alert("An error occurred while submitting feedback.");
                }
            });

            let button = document.getElementById("goBackButton");
            button.textContent = "GO BACK";
            button.addEventListener("click", function() {
                window.location.href = "index.html";
            });

        } else {
            alert("Course not found!");
            window.location.href = "index.html";
        }

        document.getElementById("showFeedback").addEventListener("click", function() {
            window.location.href = `feedback.html?courseId=${courseId}`;
        });

    }, (error) => {
        console.error("Error loading course content:", error);
        alert("An error occurred while loading the course content.");
    });
}