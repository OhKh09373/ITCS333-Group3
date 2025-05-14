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
        if (!response.ok) throw new Error('Failed to fetch news!');

        const data = await response.json();

        // Map data into our structure
        allNews = data.map(item => ({
            id: item.id,
            title: capitalize(item.title),
            body: item.body.slice(0,100),
            category: getRandomCategory(),
            date: getRandomDate(),
            imageUrl: `https://picsum.photos/id/${item.id}/800/400`,
            details: item.body
        }));

        filteredNews = [...allNews];
        renderNews();
    } catch (error) {
        newsGrid.innerHTML = `<p class="error">Error loading news: ${error.message}</p>`;
    }
}

// Render news items
function renderNews() {
    newsGrid.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredNews.slice(startIndex, startIndex + itemsPerPage); //for filter

    if (pageItems.length === 0) {
        newsGrid.innerHTML = '<p>No news found.</p>';
        return;
    }

    pageItems.forEach(news => {
        const article = document.createElement('article');
        article.className = 'news-card';
        article.innerHTML = `
            <img src="${news.imageUrl}" alt="News Image" class="news-image">
            <div class="news-content">
                <h3>${news.title}</h3>
                <p class="news-date">Publish date: <time>${news.date.toDateString()}</time></p>
                <p class="news-category category-${news.category.toLowerCase()}">${capitalizeCategory(news.category)}</p>
                <p>
                    ${news.body.slice(0, 100)}...
                    <span><a href="details1.html?id=${news.id}
                    &title=${encodeURIComponent(news.title)}
                    &category=${encodeURIComponent(news.category)}
                    &date=${encodeURIComponent(news.date.toISOString())}
                    &body=${encodeURIComponent(news.body)}
                    &imageUrl=${encodeURIComponent(news.imageUrl)}
                    &details=${encodeURIComponent(news.details)}">Read more</a></span>
                </p>
            </div>
        `;
        newsGrid.appendChild(article);
    });

    updatePagination();
}

// Update pagination links
function updatePagination() {
    const pageCount = Math.ceil(filteredNews.length / itemsPerPage);
    const maxVisiblePages = 3; // Maximum number of visible page links
    paginationContainer.innerHTML = ''; // Clear existing pagination links

    // Add "Previous" button
    const prevButton = document.createElement('a');
    prevButton.href = '#';
    prevButton.textContent = '<';
    prevButton.classList.add('prev');
    if (currentPage === 1) prevButton.classList.add('disabled');
    prevButton.onclick = (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderNews();
        }
    };
    paginationContainer.appendChild(prevButton);

    // Calculate visible page range
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);

    // Add page number links
    for (let i = startPage; i <= endPage; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        if (i === currentPage) pageLink.classList.add('active');
        pageLink.onclick = (e) => {
            e.preventDefault();
            currentPage = i;
            renderNews();
        };
        paginationContainer.appendChild(pageLink);
    }

    // Add "Next" button
    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.textContent = '>';
    nextButton.classList.add('next');
    if (currentPage === pageCount) nextButton.classList.add('disabled');
    nextButton.onclick = (e) => {
        e.preventDefault();
        if (currentPage < pageCount) {
            currentPage++;
            renderNews();
        }
    };
    paginationContainer.appendChild(nextButton);
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
}

// Show loading
function showLoading() {
    newsGrid.innerHTML = '<p> Loading news... </p>';
}

// Utilities
function getRandomCategory() {
    const categories = [
        'academic', 'sports', 'student', 'health', 'environment',
        'alumni', 'development', 'cultural', 'community', 'technology'
    ];
    return categories[Math.floor(Math.random() * categories.length)];
}

function getRandomDate() {
    const start = new Date(2023, 0, 1);
    const end = new Date(2025, 3, 1);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function capitalize(str) {
    return str
        .split(' ') // Split the string into an array of words
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(' '); // Join the words back into a single string
}

function capitalizeCategory(category) {
    return category.replace(/^\w/, c => c.toUpperCase()) + ' News';
}

// Start fetching news on load
fetchNews();

