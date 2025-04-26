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
  
    function showLoading() {
      groupCardsContainer.innerHTML = '<p>Loading study groups...</p>';
    }
  
    function showError() {
      groupCardsContainer.innerHTML = '<p>Failed to load study groups. Please try again later.</p>';
    }
  
  
  
    const coursesList = [
      { name: 'CS 333 - Web Development', category: 'ITCS' },
      { name: 'CS 440 - Intelligent Systems', category: 'ITCS' },
      { name: 'AI 350 - Machine Learning', category: 'ITAI' },
      { name: 'SE 210 - Software Engineering Basics', category: 'ITSE' },
      { name: 'CE 101 - Computer Engineering Introduction', category: 'ITCE' },
      { name: 'BUS 200 - Business Management', category: 'BUSM' },
      { name: 'FI 301 - Financial Accounting', category: 'BUFI' },
      { name: 'PH 150 - General Physics', category: 'SCPH' },
      { name: 'CH 120 - Organic Chemistry', category: 'SCCY' },
      { name: 'BI 210 - Cell Biology', category: 'SCBI' }
    ];
    
  
    function createCardElement(group) {
      const card = document.createElement('div');
      card.className = 'group-card';
      card.innerHTML = `
        <img src="${group.image}" alt="${group.title}" class="group-image"/>
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
  
      // Search filter
      if (searchTerm) {
        filteredCards = filteredCards.filter(card =>
          card.title.toLowerCase().includes(searchTerm) ||
          card.course.toLowerCase().includes(searchTerm) ||
          card.description.toLowerCase().includes(searchTerm)
        );
      }
  
      // Category filter
      if (selectedFilter) {
        filteredCards = filteredCards.filter(card => card.category === selectedFilter);
      }
  
      // Sorting
      if (selectedSort === 'a-z') {
        filteredCards.sort((a, b) => a.title.localeCompare(b.title));
      } else if (selectedSort === 'newest') {
        filteredCards.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (selectedSort === 'oldest') {
        filteredCards.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
  
      // Handle no search results
      if (filteredCards.length === 0) {
        groupCardsContainer.innerHTML = '<p>No study groups found.</p>';
        pageNumbersContainer.innerHTML = '';
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
        return;
      }
  
      // Pagination
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
  
      // Render pagination numbers
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
  
      // Show/Hide prev/next buttons
      prevButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
      nextButton.style.display = currentPage < totalPages ? 'inline-block' : 'none';
    }
  
    function getRandomPastDate(daysAgo = 60) {
      const today = new Date();
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - Math.floor(Math.random() * daysAgo));
      return pastDate.toISOString().split('T')[0];
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
            image: 'https://via.placeholder.com/300',
            detailsPage: `details.html`,
            category: randomCourse.category
          };
        });
        
  
        updateDisplay();
      } catch (error) {
        console.error('Error fetching study groups:', error);
        showError();
      }
    }
  
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
  