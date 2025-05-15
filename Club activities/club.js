
let activities = [];
let filteredActivities = [];
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 4;

const API_URL = "https://146ea1a5-b5cb-45cd-bbc3-cc8077b8a620-00-25mk2jkejvzra.pike.replit.dev/api.php";

const activityGrid = document.querySelector(".activities-grid");
const pagination = document.querySelector(".pagination ul");
const searchInput = document.querySelector("input[type='search']");
const categoryFilter = document.querySelector("select:nth-of-type(1)");
const sortSelect = document.querySelector("select:nth-of-type(2)");
const searchButton = document.querySelector("button[type='submit']");
const addForm = document.getElementById("addActivityForm");
const editForm = document.getElementById("editActivityForm");
const editModal = document.getElementById("editModal");

async function fetchActivities(page = 1) {
    activityGrid.innerHTML = `<div style="text-align:center;"><div class="spinner"></div><p>Loading activities...</p></div>`;
    try {
        const response = await fetch(`${API_URL}?page=${page}&limit=${itemsPerPage}`);
        if (!response.ok) throw new Error("Network error");
        const result = await response.json();

        activities = result.data || [];
        filteredActivities = [...activities];

        currentPage = result.pagination?.page || 1;
        totalPages = result.pagination?.pages || 1;

        applySorting();
        renderActivities();
        renderPagination(totalPages);
    } catch (error) {
        console.error("Error fetching activities:", error);
        activityGrid.innerHTML = `<p style="color:red; text-align:center;">Failed to load activities.</p>`;
    }
}

async function renderActivities() {
    if (!filteredActivities.length) {
        activityGrid.innerHTML = "<p>No activities found.</p>";
        pagination.innerHTML = "";
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const activitiesToRender = filteredActivities.slice(start, end);

    activityGrid.innerHTML = "";

    for (const activity of activitiesToRender) {
        const comments = await fetch(`${API_URL}?table=comments&activity_id=${activity.id}`)
            .then(res => res.json())
            .catch(() => []);

        const commentHTML = comments.map(c => `
            <div class="comment">
                <strong>${c.author}</strong>: ${c.content}
            </div>
        `).join("");

        activityGrid.innerHTML += `
           <article>
        <h2>${activity.title}</h2>
        <p><strong>Club:</strong> ${activity.club}</p>
        <p><strong>Date:</strong> ${activity.date}</p>
        <p><strong>Category:</strong> ${activity.category}</p>
        <p>${activity.description}</p>

        <button onclick="toggleComments(${activity.id})" class="toggle-btn">Show Comments</button>
        
        <div id="comments-${activity.id}" class="comments" style="display: none;">
            <h4>Comments</h4>
            ${commentHTML || "<p>No comments yet.</p>"}
            <form onsubmit="submitComment(event, ${activity.id})">
                <input type="text" name="author" placeholder="Your name" required>
                <input type="text" name="content" placeholder="Your comment" required>
                <button type="submit">Add Comment</button>
            </form>
        </div>

        <button onclick="openEditModal(${activity.id})">Edit</button>
        <button onclick="deleteActivity(${activity.id})">Delete</button>
           </article>
      `;

    }
}
function toggleComments(activityId) {
    const commentDiv = document.getElementById(`comments-${activityId}`);
    const toggleBtn = document.querySelector(`button.toggle-btn[onclick="toggleComments(${activityId})"]`);

    if (commentDiv.style.display === "none") {
        commentDiv.style.display = "block";
        toggleBtn.textContent = "Hide Comments";
    } else {
        commentDiv.style.display = "none";
        toggleBtn.textContent = "Show Comments";
    }
}


function renderPagination(totalPages) {
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    if (currentPage > 1) {
        pagination.innerHTML += `<li><a href="#" onclick="changePage(${currentPage - 1})">« Prev</a></li>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += i === currentPage
            ? `<li><strong>${i}</strong></li>`
            : `<li><a href="#" onclick="changePage(${i})">${i}</a></li>`;
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `<li><a href="#" onclick="changePage(${currentPage + 1})">Next »</a></li>`;
    }
}

function changePage(page) {
    currentPage = page;
    renderActivities();
    renderPagination(totalPages);
}

function handleSearch(event) {
    event.preventDefault();
    const keyword = searchInput.value.toLowerCase();
    const category = categoryFilter.value;

    filteredActivities = activities.filter(activity => {
        const matchesKeyword = activity.title.toLowerCase().includes(keyword) || activity.description.toLowerCase().includes(keyword);
        const matchesCategory = category === "All Categories" || activity.category === category;
        return matchesKeyword && matchesCategory;
    });

    applySorting();
    currentPage = 1;
    renderActivities();
    renderPagination(Math.ceil(filteredActivities.length / itemsPerPage));
}

function applySorting() {
    const sortBy = sortSelect.value;
    if (sortBy === "Sort by Date") {
        filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "Sort by Club Name") {
        filteredActivities.sort((a, b) => a.club.localeCompare(b.club));
    }
}

// Add activity
document.querySelector("form").addEventListener("submit", function(e) {
    e.preventDefault();
    const title = document.getElementById("title");
    const club = document.getElementById("club");
    const date = document.getElementById("date");
    const desc = document.getElementById("description");
  
    if (!title.value.trim()) return alert("Title is required!");
    if (!club.value.trim()) return alert("Club name is required!");
    if (!date.value.trim()) return alert("Date is required!");
    if (!desc.value.trim()) return alert("Description is required!");
  
    alert("Activity validated and ready to be submitted!");
  });
  


function openEditModal(id) {
    const activity = [...activities, ...filteredActivities].find(a => a.id == id);
    if (!activity) {
        alert("Activity not found!");
        return;
    }
    
   
    document.getElementById("editId").value = activity.id;
    document.getElementById("editTitle").value = activity.title;
    document.getElementById("editClub").value = activity.club;
    document.getElementById("editDate").value = activity.date;
    document.getElementById("editDescription").value = activity.description;
    document.getElementById("editCategory").value = activity.category;
    
    
    editModal.style.display = "block";
}


editForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("editId").value;
    if (!id) {
        alert("Missing activity ID");
        return;
    }

    const updatedData = {
        id: id,
        title: document.getElementById("editTitle").value,
        club: document.getElementById("editClub").value,
        date: document.getElementById("editDate").value,
        description: document.getElementById("editDescription").value,
        category: document.getElementById("editCategory").value
    };

    try {
        const response = await fetch(API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();
        
        if (response.ok) {
            editModal.style.display = "none";
            fetchActivities(currentPage); 
        } else {
            throw new Error(result.error || "Update failed");
        }
    } catch (error) {
        console.error("Edit error:", error);
        alert("Failed to update activity. Check console for details.");
    }
});



async function deleteActivity(id) {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    try {
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Failed to delete activity");
        fetchActivities(currentPage);
    } catch (err) {
        alert("Error deleting activity");
    }
}

async function submitComment(event, activityId) {
    event.preventDefault();
    const form = event.target;
    const data = {
        activity_id: activityId,
        author: form.author.value,
        content: form.content.value
    };

    try {
        const response = await fetch(`${API_URL}?table=comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error("Failed to submit comment");

        fetchActivities(currentPage);
    } catch (err) {
        alert("Error submitting comment");
    }
}


searchButton?.addEventListener("click", handleSearch);
categoryFilter?.addEventListener("change", () => handleSearch(new Event('submit')));
sortSelect?.addEventListener("change", () => {
    applySorting();
    renderActivities();
});

fetchActivities();
