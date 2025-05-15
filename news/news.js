const newsGrid = document.querySelector('.news-grid');
const searchInput = document.querySelector('.search-bar input');
const filterSelect = document.querySelector('.filter-section select:nth-of-type(1)');
const sortSelect = document.querySelector('.filter-section select:nth-of-type(2)');
const paginationContainer = document.querySelector('.pagination');

let currentPage = 1;
const itemsPerPage = 4;
let totalNewsCount = 0;

async function fetchNews() {
    try {
        newsGrid.innerHTML = '<p>Loading news...</p>';

        const searchQuery = searchInput.value.trim();
        const categoryFilter = filterSelect.value;
        const sortOption = sortSelect.value;

        const params = new URLSearchParams({
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage,
            search: searchQuery,
            category: categoryFilter,
            sort: sortOption
        });

        const response = await fetch(`https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev/news.php?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch news');

        const data = await response.json();

        const replitBaseUrl = 'https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev';

        const newsData = data.data;
        totalNewsCount = data.total || newsData.length;

        if (newsData.length === 0) {
            newsGrid.innerHTML = '<p>No news found.</p>';
            paginationContainer.innerHTML = '';
            return;
        }

        newsGrid.innerHTML = '';
        newsData.forEach(news => {
            const article = document.createElement('article');
            article.className = 'news-card';

            const categorySlug = news.category.toLowerCase().replace(/\s+/g, '-');

            article.innerHTML = `
                <img src="${news.image_url ? replitBaseUrl + news.image_url : `https://picsum.photos/id/${news.id}/800/400`}" alt="News Image" class="news-image">
                <div class="news-content">
                    <h3>${news.title}</h3>
                    <p class="news-date">Publish date: ${new Date(news.publish_date).toDateString()}</p>
                    <p class="news-category category-${categorySlug}">${news.category}</p>
                    <p>${news.short_desc}... 
                       <a href="details1.html?id=${news.id}">Read more</a>
                    </p>
                </div>
            `;
            newsGrid.appendChild(article);
        });

        updatePagination();
    } catch (error) {
        newsGrid.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

function updatePagination() {
    const totalPages = Math.ceil(totalNewsCount / itemsPerPage);
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = createPageButton('<', currentPage > 1, () => {
        currentPage--;
        fetchNews();
    });
    paginationContainer.appendChild(prevButton);

    // Limited 3-number pagination window
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPageButton(i, true, () => {
            currentPage = i;
            fetchNews();
        }, currentPage === i);
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = createPageButton('>', currentPage < totalPages, () => {
        currentPage++;
        fetchNews();
    });
    paginationContainer.appendChild(nextButton);
}

function createPageButton(label, enabled, onClick, active = false) {
    const button = document.createElement('a');
    button.href = '#';
    button.textContent = label;
    if (!enabled) button.classList.add('disabled');
    if (active) button.classList.add('active');
    button.addEventListener('click', (e) => {
        e.preventDefault();
        if (enabled) onClick();
    });
    return button;
}

function handleSearchFilterSort() {
    currentPage = 1;
    fetchNews();
}

// Event Listeners
searchInput.addEventListener('input', handleSearchFilterSort);
filterSelect.addEventListener('change', handleSearchFilterSort);
sortSelect.addEventListener('change', handleSearchFilterSort);

// Initial load
fetchNews();
