document.addEventListener('DOMContentLoaded', () => {
  // you must update this for replit
  const API_URL = 'https://51d46a5b-bcbc-4de5-8e6d-10e6737ac545-00-2qupdl9b1aqfv.pike.replit.dev/api/study-groups/index.php' 

  const searchInput = document.querySelector('#search-bar')
  const filterSelect = document.querySelector('#filter-select')
  const sortSelect = document.querySelector('#sort-select')
  const groupCardsContainer = document.querySelector('.grid-container')
  const prevButton = document.querySelector('.prev-button')
  const nextButton = document.querySelector('.next-button')
  const pageNumbersContainer = document.querySelector('.page-numbers')

  let allGroupCardsData = []
  let currentPage = 1
  const cardsPerPage = 6

  function showLoading() {
    groupCardsContainer.innerHTML = '<p class="loading">Loading study groups...</p>'
  }

  function showError() {
    groupCardsContainer.innerHTML = '<p class="error">Failed to load study groups. Please try again later.</p>'
  }

  function createCardElement(group) {
    const card = document.createElement('div')
    card.className = 'group-card'
    card.innerHTML = `
      <div class="image-container">
        <img src="${group.image_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300'}"
             alt="${group.name}" class="group-image"
             onerror="this.src='https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300'">
      </div>
      <div class="group-details">
        <h3>${group.name}</h3>
        <p class="group-meta">
          <span class="meta-label">Course:</span>
          <span class="meta-value">${group.course}</span>
        </p>
        <p class="group-description">${group.description.slice(0, 100)}...</p>
        <span class="group-date">Created: ${new Date(group.created_at).toLocaleDateString()}</span>
        <button class="details-button" onclick="window.location.href='SG1.html?id=${group.id}'">Details</button>
      </div>
    `
    return card
  }

  function updateDisplay() {
    const searchTerm = searchInput.value.toLowerCase()
    const selectedFilter = filterSelect.value
    const selectedSort = sortSelect.value

    let filtered = allGroupCardsData.filter(group =>
      group.name.toLowerCase().includes(searchTerm) ||
      group.course.toLowerCase().includes(searchTerm)
    )

    if (selectedFilter) {
      filtered = filtered.filter(group => group.course.includes(selectedFilter))
    }

    if (selectedSort === 'a-z') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    } else if (selectedSort === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (selectedSort === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    }

    if (filtered.length === 0) {
      groupCardsContainer.innerHTML = '<p class="no-results">No study groups found.</p>'
      pageNumbersContainer.innerHTML = ''
      prevButton.style.display = 'none'
      nextButton.style.display = 'none'
      return
    }

    const totalPages = Math.ceil(filtered.length / cardsPerPage)
    currentPage = Math.min(currentPage, totalPages)

    const start = (currentPage - 1) * cardsPerPage
    const end = start + cardsPerPage
    const paginated = filtered.slice(start, end)

    groupCardsContainer.innerHTML = ''
    paginated.forEach(group => {
      groupCardsContainer.appendChild(createCardElement(group))
    })

    pageNumbersContainer.innerHTML = ''
    for (let i = 1; i <= totalPages; i++) {
      const span = document.createElement('span')
      span.className = 'page-number'
      span.textContent = i
      if (i === currentPage) span.classList.add('active')
      span.addEventListener('click', () => {
        currentPage = i
        updateDisplay()
      })
      pageNumbersContainer.appendChild(span)
    }

    prevButton.style.display = currentPage > 1 ? 'inline-block' : 'none'
    nextButton.style.display = currentPage < totalPages ? 'inline-block' : 'none'
  }

  async function fetchStudyGroups() {
    showLoading()
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('Failed to fetch groups')
      const data = await res.json()
      allGroupCardsData = data
      updateDisplay()
    } catch (err) {
      console.error('Fetch error:', err)
      showError()
    }
  }

  // Event listeners
  searchInput.addEventListener('input', () => {
    currentPage = 1
    updateDisplay()
  })
  filterSelect.addEventListener('change', () => {
    currentPage = 1
    updateDisplay()
  })
  sortSelect.addEventListener('change', () => {
    currentPage = 1
    updateDisplay()
  })
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--
      updateDisplay()
    }
  })
  nextButton.addEventListener('click', () => {
    currentPage++
    updateDisplay()
  })

  fetchStudyGroups()
})
