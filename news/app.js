// app.js

// Get DOM elements
const newsGrid = document.querySelector('.news-grid');
const searchInput = document.querySelector('.search-bar input');
const filterSelect = document.querySelector('.filter-section select:nth-of-type(1)');
const sortSelect = document.querySelector('.filter-section select:nth-of-type(2)');
const paginationContainer = document.querySelector('.pagination');

// State variables
let allNews = [];
let filteredNews = [];
let currentPage = 1;
const itemsPerPage = 4;

// Fetch data from API
async function fetchNews() {
    try {
        showLoading();
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        if (!response.ok) throw new Error('Failed to fetch news.');

        const data = await response.json();

        // Map data into our structure
        allNews = data.slice(0, 30).map(item => ({
            id: item.id,
            title: capitalize(item.title),
            body: item.body,
            category: getRandomCategory(),
            date: getRandomDate(),
            imageNumber: getRandomImageNumber()
        }));

        filteredNews = [...allNews];
        renderNews();
        renderPagination();
    } catch (error) {
        newsGrid.innerHTML = `<p class="error">Error loading news: ${error.message}</p>`;
    } finally {
        hideLoading();
    }
}

// Render news items
function renderNews() {
    newsGrid.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredNews.slice(startIndex, startIndex + itemsPerPage);

    if (pageItems.length === 0) {
        newsGrid.innerHTML = '<p>No news found.</p>';
        return;
    }

    pageItems.forEach(news => {
        const article = document.createElement('article');
        article.className = 'news-card';
        article.innerHTML = `
            <img src="${news.imageNumber}.jpg" alt="News Image" class="news-image">
            <div class="news-content">
                <h3>${news.title}</h3>
                <p class="news-date">Publish date: <time>${news.date.toDateString()}</time></p>
                <p class="news-category category-${news.category.toLowerCase()}">${capitalizeCategory(news.category)}</p>
                <p>
                    ${news.body.slice(0, 100)}...
                    <span><a href="details1.html?id=${news.id}">Read more</a></span>
                </p>
            </div>
        `;
        newsGrid.appendChild(article);
    });
}

// Render pagination buttons
function renderPagination() {
    paginationContainer.innerHTML = '';

    const pageCount = Math.ceil(filteredNews.length / itemsPerPage);

    if (pageCount <= 1) return;

    const prevButton = createPageButton('<', currentPage > 1 ? currentPage - 1 : null);
    paginationContainer.appendChild(prevButton);

    for (let i = 1; i <= pageCount; i++) {
        const pageButton = createPageButton(i, i);
        if (i === currentPage) pageButton.classList.add('active');
        paginationContainer.appendChild(pageButton);
    }

    const nextButton = createPageButton('>', currentPage < pageCount ? currentPage + 1 : null);
    paginationContainer.appendChild(nextButton);
}

// Create individual page button
function createPageButton(text, page) {
    const link = document.createElement('a');
    link.href = '#';
    link.textContent = text;

    if (!page) {
        link.classList.add('disabled');
        return link;
    }

    link.addEventListener('click', e => {
        e.preventDefault();
        currentPage = page;
        renderNews();
        renderPagination();
    });

    return link;
}

// Event listeners
searchInput.addEventListener('input', handleSearchFilterSort);
filterSelect.addEventListener('change', handleSearchFilterSort);
sortSelect.addEventListener('change', handleSearchFilterSort);

// Handle search, filter, sort
function handleSearchFilterSort() {
    const searchText = searchInput.value.toLowerCase();
    const selectedCategory = filterSelect.value;
    const selectedSort = sortSelect.value;

    filteredNews = allNews.filter(news => {
        const matchesSearch = news.title.toLowerCase().includes(searchText) || news.body.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory ? news.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    if (selectedSort) {
        if (selectedSort === 'newest') {
            filteredNews.sort((a, b) => b.date - a.date);
        } else if (selectedSort === 'oldest') {
            filteredNews.sort((a, b) => a.date - b.date);
        } else if (selectedSort === 'title') {
            filteredNews.sort((a, b) => a.title.localeCompare(b.title));
        }
    }

    currentPage = 1;
    renderNews();
    renderPagination();
}

// Show loading
function showLoading() {
    newsGrid.innerHTML = '<p>Loading news...</p>';
}

// Hide loading
function hideLoading() {
    // nothing needed now
}

// Utilities
function getRandomCategory() {
    const categories = [
        'academic', 'sports', 'student', 'health', 'environment',
        'alumni', 'development', 'cultural', 'community', 'technology'
    ];
    return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomImageNumber() {
    return Math.floor(Math.random() * 6) + 1; // 1 to 6
}

function getRandomDate() {
    const start = new Date(2023, 0, 1);
    const end = new Date(2025, 3, 1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function capitalizeCategory(category) {
    return category.replace(/^\w/, c => c.toUpperCase()) + ' News';
}

// Start fetching news on load
fetchNews();
