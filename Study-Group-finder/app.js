document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('#search-bar');
  const filterSelect = document.querySelector('#filter-select');
  const sortSelect = document.querySelector('#sort-select');
  const groupCardsContainer = document.querySelector('.grid-container');
  const prevButton = document.querySelector('.prev-button');
  const nextButton = document.querySelector('.next-button');
  const pageNumbersContainer = document.querySelector('.page-numbers');

  let allGroupCardsData = []; 
  let currentPage = 1;
  const cardsPerPage = 6;

  // Pre-defined list of working study-related images
  const studyImages = [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300',
    'https://images.unsplash.com/photo-1524179091875-b48999981497?w=300',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300',
    'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=300',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300'
  ];

 const coursesList = [
    { name: 'ITCS333 - Web Development', category: 'ITCS' },
    { name: 'ITCS440 - Intelligent Systems', category: 'ITCS' },
    { name: 'ITAI350 - Machine Learning', category: 'ITAI' },
    { name: 'ITSE210 - Software Engineering Basics', category: 'ITSE' },
    { name: 'ITCE101 - Computer Engineering Introduction', category: 'ITCE' },
    { name: 'BUSM200 - Business Management', category: 'BUSM' },
    { name: 'BUFI301 - Financial Accounting', category: 'BUFI' },
    { name: 'SCPH150 - General Physics', category: 'SCPH' },
    { name: 'SCCY120 - Organic Chemistry', category: 'SCCY' },
    { name: 'SCBI210 - Cell Biology', category: 'SCBI' }
  ];

  function showLoading() {
    groupCardsContainer.innerHTML = '<p class="loading">Loading study groups...</p>';
  }

  function showError() {
    groupCardsContainer.innerHTML = '<p class="error">Failed to load study groups. Please try again later.</p>';
  }

  function getRandomImage() {
    // Get a random image from our pre-defined array
    return studyImages[Math.floor(Math.random() * studyImages.length)];
  }

  function getRandomPastDate(daysAgo = 360) {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * daysAgo));
    return pastDate.toISOString().split('T')[0];
  }

  function createCardElement(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.innerHTML = `
      <div class="image-container">
        <img src="${group.image}" alt="${group.title}" class="group-image"
             onerror="this.src='https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300'">
      </div>
      <div class="group-details">
        <h3>${group.title}</h3>
        <p class="group-meta">
          <span class="meta-label">Course:</span>
          <span class="meta-value">${group.course}</span>
        </p>
        <p class="group-description">${group.description}</p>
        <span class="group-date">Created: ${group.date}</span>
        <button class="details-button" onclick="window.location.href='${group.detailsPage}'">Details</button>
      </div>
    `;
    return card;
  }

  function updateDisplay() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedFilter = filterSelect.value;
    const selectedSort = sortSelect.value;

    let filteredCards = allGroupCardsData;

    if (searchTerm) {
      filteredCards = filteredCards.filter(card =>
        card.title.toLowerCase().includes(searchTerm) ||
        card.course.toLowerCase().includes(searchTerm)
      );
    }

    if (selectedFilter) {
      filteredCards = filteredCards.filter(card => card.category === selectedFilter);
    }

    if (selectedSort === 'a-z') {
      filteredCards.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'newest') {
      filteredCards.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (selectedSort === 'oldest') {
      filteredCards.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (filteredCards.length === 0) {
      groupCardsContainer.innerHTML = '<p class="no-results">No study groups found.</p>';
      pageNumbersContainer.innerHTML = '';
      prevButton.style.display = 'none';
      nextButton.style.display = 'none';
      return;
    }

    const totalPages = Math.ceil(filteredCards.length / cardsPerPage);
    currentPage = Math.min(currentPage, totalPages);

    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const paginatedCards = filteredCards.slice(startIndex, endIndex);

    groupCardsContainer.innerHTML = '';
    paginatedCards.forEach(card => {
      const cardElement = createCardElement(card);
      groupCardsContainer.appendChild(cardElement);
    });

    pageNumbersContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const pageNumber = document.createElement('span');
      pageNumber.className = 'page-number';
      if (i === currentPage) pageNumber.classList.add('active');
      pageNumber.textContent = i;
      pageNumber.addEventListener('click', () => {
        currentPage = i;
        updateDisplay();
      });
      pageNumbersContainer.appendChild(pageNumber);
    }

    prevButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
    nextButton.style.display = currentPage < totalPages ? 'inline-block' : 'none';
  }

  async function fetchStudyGroups() {
    showLoading();
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      allGroupCardsData = data.slice(0, 9).map((item, index) => {
        const randomCourse = coursesList[Math.floor(Math.random() * coursesList.length)];
        
        return {
          title: item.title.substring(0, 20),
          course: randomCourse.name,
          description: item.body.substring(0, 50),
          date: getRandomPastDate(60),
          image: getRandomImage(),
          detailsPage: 'SG1.html',
          category: randomCourse.category
        };
      });
      
      updateDisplay();
    } catch (error) {
      console.error('Error fetching study groups:', error);
      showError();
    }
  }

  // Event listeners
  searchInput.addEventListener('input', () => {
    currentPage = 1;
    updateDisplay();
  });
  filterSelect.addEventListener('change', () => {
    currentPage = 1;
    updateDisplay();
  });
  sortSelect.addEventListener('change', () => {
    currentPage = 1;
    updateDisplay();
  });
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updateDisplay();
    }
  });
  nextButton.addEventListener('click', () => {
    currentPage++;
    updateDisplay();
  });

  fetchStudyGroups();
});