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
            if (course.videoUrl) {
                let videoUrl = course.videoUrl;
                if (videoUrl.includes("watch?v=")) {
                    videoUrl = videoUrl.replace("watch?v=", "embed/");
                }
                document.getElementById("videoContainer").innerHTML = `
                    <iframe src="${videoUrl}" title="Course Video" allowfullscreen></iframe>
                `;
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


                    if (this.checked) {
                        this.disabled = true;

                        label.textContent = 'Course Completed!';
                    }

                } catch (error) {
                    console.error("Error saving course completion:", error);
                }
            });


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


                        checkbox.checked = isCompleted;


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



            const feedbackText = document.getElementById("feedbackText");
            const starRating = document.getElementById("starRating");
            const stars = starRating.querySelectorAll(".star");
            const submitFeedbackButton = document.getElementById("submitFeedback");

            let selectedRating = 0;


            stars.forEach(star => {
                star.addEventListener("click", () => {
                    selectedRating = parseInt(star.getAttribute("data-value"));
                    stars.forEach(s => {
                        //select the real number of star that student click on it
                        if (parseInt(s.getAttribute("data-value")) <= selectedRating) {
                            // it modify in css to change the color of the star
                            s.classList.add("selected");
                        } else {
                            //remove the stars not selected
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
                window.location.href = "show_all_courses.html";
            });

        } else {
            alert("Course not found!");
            window.location.href = "show_all_courses.html";
        }

        document.getElementById("showFeedback").addEventListener("click", function() {
            window.location.href = `feedback.html?courseId=${courseId}`;
        });

    }, (error) => {
        console.error("Error loading course content:", error);
        alert("An error occurred while loading the course content.");
    });
}