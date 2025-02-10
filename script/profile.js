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
    serverTimestamp,
    logout
} from "./module.js";


const userName = document.getElementById("user-name");
const userAvatar = document.getElementById("user-avatar");
const gridContainer = document.querySelector(".grid");
const logoutButton = document.getElementById("logout-button");


async function fetchUserProfile(userId) {
    try {
        const userRef = doc(db, "student", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            userName.textContent = userData.name || "No Name";
            userAvatar.src = userData.avatar || "images/Avatar.png";
        } else {
            userName.textContent = "Unknown User";
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

async function fetchCompletedCourses(userId) {
    try {
        const completedCoursesQuery = query(
            collection(db, "coursecompleted"),
            where("userId", "==", userId),
            where("isCompleted", "==", true)
        );

        const querySnapshot = await getDocs(completedCoursesQuery);

        if (querySnapshot.empty) {
            gridContainer.innerHTML = "<p>No completed courses found.</p>";
            return;
        }

        const courses = [];

        for (const docSnap of querySnapshot.docs) {
            const courseData = docSnap.data();
            const courseId = courseData.courseId;

            const courseRef = doc(db, "courses", courseId);
            const courseSnap = await getDoc(courseRef);

            if (courseSnap.exists()) {
                const courseInfo = courseSnap.data();
                courses.push({
                    id: courseId,
                    title: courseInfo.title || "Untitled Course",
                    image: courseInfo.image || "images/default-course.jpg",
                    description: courseInfo.description || "No description available.",
                    category: courseInfo.category || "No category"
                });
            }
        }

        renderCourses(courses);
    } catch (error) {
        console.error("Error fetching completed courses:", error);
        gridContainer.innerHTML = "<p>Error loading courses.</p>";
    }
}


function renderCourses(courses) {
    gridContainer.innerHTML = "";
    courses.forEach((course) => {
        const courseElement = document.createElement("div");
        courseElement.classList.add("course-card");
        courseElement.innerHTML = `
            <img src="${course.image}" alt="${course.title}">
            <h3>${course.title}</h3>
            <p>${course.description}</p>
            <p><strong>Category:</strong> ${course.category}</p>
            <button class="course-btn" data-id="${course.id}">View Course</button>
            <button class="certificate-btn" data-id="${course.id}">Certificate</button>
        `;

        gridContainer.appendChild(courseElement);
    });


    document.querySelectorAll(".course-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const courseId = e.target.dataset.id;
            window.location.href = `vidoes.html?courseId=${courseId}`;
        });
    });

    document.querySelectorAll(".certificate-btn").forEach((button) => {
        button.addEventListener("click", (e) => {
            const courseId = e.target.dataset.id;
            window.location.href = `certificate.html?courseId=${courseId}`;
        });
    });
}


onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchUserProfile(user.uid);
        fetchCompletedCourses(user.uid);
    } else {
        window.location.href = "login.html";
    }
});

document.getElementById("logout-btn").addEventListener("click", logout);