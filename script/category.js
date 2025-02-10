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






async function fetchCategories() {
    const categoryList = document.getElementById("category-list");
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


            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-btn");
            deleteButton.setAttribute("data-id", doc.id);
            deleteButton.onclick = () => deleteCategory(doc.id);


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


const categoryForm = document.getElementById("category-form");
categoryForm.addEventListener("submit", async(e) => {
    e.preventDefault();
    const categoryNameInput = document.getElementById("category-name");
    const name = categoryNameInput.value.trim();
    const regex = /^[a-zA-Z\s\-]+[^\s]$/;
    if (!name || name.length < 3 || !regex.test(name)) {
        alert("Your Category Name must be at least 3 characters long and contain only alphabets and spaces.");
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



async function deleteCategory(categoryId) {
    try {
        const isConfirmed = confirm("Are you sure you want to delete this Category?");

        if (isConfirmed) {


            const coursesSnapshot = await getDocs(collection(db, "courses"));
            const name = await getCategoryName(categoryId);
            coursesSnapshot.forEach(async(courseDoc) => {
                const courseData = courseDoc.data();
                if (courseData.category === name) {
                    await deleteDoc(doc(db, "courses", courseDoc.id));
                }
            });

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

    const categoryNameInput = document.getElementById("category-name");
    //const newName = prompt("Enter the new name for the category:").trim();

    categoryNameInput.focus();
    const newName = categoryNameInput.value.trim();

    const regex = /^[a-zA-Z\s\-]+[^\s]$/;
    if (!newName || !regex.test(newName)) {
        alert("Category name must be at least 3 characters long and contain only letters and spaces.");
        return;
    }

    try {
        const categoryRef = doc(db, "categories", categoryId);

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoryExists = categoriesSnapshot.docs.some(docSnap =>
            docSnap.id !== categoryId && docSnap.data().name.toLowerCase() === newName.toLowerCase()
        );

        if (categoryExists) {
            alert("Category already exists!");
            return;
        }

        const name = await getCategoryName(categoryId);
        await updateDoc(categoryRef, { name: newName });

        //const coursesSnapshot = await getDocs(collection(db, "courses"));
        const snapshot = await getDocs(collection(db, "courses"));


        snapshot.forEach(async(doc) => {
            const courseData = doc.data();
            if (courseData.category === name) {
                await updateDoc(doc.ref, { category: newName });
            }
        });

        categoryNameInput.value = "";
        fetchCategories();

    } catch (error) {
        console.error("Error updating category:", error);
        alert("An error occurred while updating the category. Please try again.");
    }
}

async function getCategoryName(categoryId) {
    if (!categoryId) return "Unknown Category";

    try {
        const categoryRef = doc(db, "categories", categoryId);
        const categorySnap = await getDoc(categoryRef);

        if (categorySnap.exists()) {
            return categorySnap.data().name;
        } else {
            //console.log(`Category ID ${categoryId} not found.`);
            return "Unknown Category";
        }
    } catch (error) {
        console.error("Error fetching category name:", error);
        return "Unknown Category";
    }
}



fetchCategories();