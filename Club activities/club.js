let activities = [];
let filteredActivities = [];
let currentPage = 1;
const itemsPerPage = 4;

const activityGrid = document.querySelector(".activities-grid");
const pagination = document.querySelector(".pagination ul");
const searchInput = document.querySelector("input[type='search']");
const categoryFilter = document.querySelector("select:nth-of-type(1)");
const sortSelect = document.querySelector("select:nth-of-type(2)");
const searchButton = document.querySelector("button[type='submit']");

// Fetch and display activities
async function fetchActivities() {
    const activitiesSection = document.querySelector(".activities-grid");

    // Show loading spinner
    activitiesSection.innerHTML = `
        <div style="text-align:center; width: 100%;">
            <div class="spinner"></div>
            <p>Loading activities...</p>
        </div>
    `;

    try {
        const response = await fetch("activities.json");
        if (!response.ok) {
            throw new Error("Network error");
        }
        activities = await response.json();
        filteredActivities = [...activities];
        renderActivities();
    } catch (error) {
        console.error("Error fetching activities:", error);
        activitiesSection.innerHTML = `
            <p style="color:red; text-align:center;">Failed to load activities. Please make sure you are running Live Server.</p>
        `;
    }
}

// Render activities
function renderActivities() {
    if (!filteredActivities.length) {
        activityGrid.innerHTML = "<p>No activities found.</p>";
        pagination.innerHTML = "";
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = filteredActivities.slice(start, end);

    activityGrid.innerHTML = currentItems.map(activity => `
        <article>
            <h2>${activity.title}</h2>
            <p><strong>Club:</strong> ${activity.club}</p>
            <p><strong>Date:</strong> ${activity.date}</p>
            <p>${activity.description}</p>
            <a href="activity-detail.html?title=${encodeURIComponent(activity.title)}">View Details</a>
        </article>
    `).join("");

    renderPagination();
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    pagination.innerHTML = "";

    if (totalPages <= 1) return;

    if (currentPage > 1) {
        pagination.innerHTML += `<li><a href="#" onclick="changePage(${currentPage - 1})">« Prev</a></li>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            pagination.innerHTML += `<li><strong>${i}</strong></li>`;
        } else {
            pagination.innerHTML += `<li><a href="#" onclick="changePage(${i})">${i}</a></li>`;
        }
    }

    if (currentPage < totalPages) {
        pagination.innerHTML += `<li><a href="#" onclick="changePage(${currentPage + 1})">Next »</a></li>`;
    }
}

function changePage(page) {
    currentPage = page;
    renderActivities();
}

// Search, Filter and Sort
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
}

function applySorting() {
    const sortBy = sortSelect.value;
    if (sortBy === "Sort by Date") {
        filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "Sort by Club Name") {
        filteredActivities.sort((a, b) => a.club.localeCompare(b.club));
    }
}

// Event Listeners
searchButton.addEventListener("click", handleSearch);
categoryFilter.addEventListener("change", () => handleSearch(new Event('submit')));
sortSelect.addEventListener("change", () => {
    applySorting();
    renderActivities();
});

// Initial Load
fetchActivities();


