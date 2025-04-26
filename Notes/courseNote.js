// Select DOM elements
const notesSection = document.querySelector('section.grid');
const searchInput = document.querySelector('input[type="search"]');
const courseFilter = document.querySelectorAll('select')[0];
const sortSelect = document.querySelectorAll('select')[1];
const paginationList = document.querySelector('.pagination');
const createForm = document.querySelector('#create form');
const detailSection = document.getElementById('detail');

// State variables
let allNotes = [];
let filteredNotes = [];
let currentPage = 1;
const notesPerPage = 2;

// Display loading spinner
function showLoading() {
    notesSection.innerHTML = '<p>Loading notes...</p>';
}

// Fetch notes from JSON
async function fetchNotes() {
    showLoading();
    try {
        const response = await fetch('notes.json');
        if (!response.ok) {
            throw new Error('Failed to fetch notes.');
        }
        const data = await response.json();
        allNotes = data;
        filteredNotes = [...allNotes];
        renderNotes();
    } catch (error) {
        notesSection.innerHTML = <p style="color: red;">${error.message}</p>;
    }
}

// Render notes
function renderNotes() {
    notesSection.innerHTML = '';

    const startIndex = (currentPage - 1) * notesPerPage;
    const endIndex = startIndex + notesPerPage;
    const notesToDisplay = filteredNotes.slice(startIndex, endIndex);

    if (notesToDisplay.length === 0) {
        notesSection.innerHTML = '<p>No notes found.</p>';
        return;
    }

    notesToDisplay.forEach(note => {
        const article = document.createElement('article');
        article.innerHTML = `
            <header>
                <h2>${note.title}</h2>
            </header>
            <p><strong>Course:</strong> ${note.course}</p>
            <p>${note.summary}</p>
            <button onclick="showDetail(${note.id})">View Detail</button>
        `;
        notesSection.appendChild(article);
    });

    renderPagination();
}

// Render pagination
function renderPagination() {
    paginationList.innerHTML = '';

    const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.innerHTML = <a href="#">${i}</a>;
        li.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            renderNotes();
        });
        paginationList.appendChild(li);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextLi = document.createElement('li');
        nextLi.innerHTML = <a href="#">Next</a>;
        nextLi.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            currentPage++;
            renderNotes();
        });
        paginationList.appendChild(nextLi);
    }
}

// Search notes
searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.toLowerCase();
    filteredNotes = allNotes.filter(note =>
        note.title.toLowerCase().includes(keyword) ||
        note.course.toLowerCase().includes(keyword) ||
        note.summary.toLowerCase().includes(keyword)
    );
    currentPage = 1;
    renderNotes();
});

// Filter by course
courseFilter.addEventListener('change', () => {
    const course = courseFilter.value;
    if (course === 'Filter by Course') {
        filteredNotes = [...allNotes];
    } else {
        filteredNotes = allNotes.filter(note => note.course === course);
    }
    currentPage = 1;
    renderNotes();
});

// Sort notes
sortSelect.addEventListener('change', () => {
    const sortOption = sortSelect.value;
    if (sortOption === 'Newest') {
        filteredNotes.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortOption === 'Oldest') {
        filteredNotes.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    currentPage = 1;
    renderNotes();
});

// Show note detail
function showDetail(noteId) {
    const note = allNotes.find(n => n.id === noteId);
    if (!note) return;

    detailSection.innerHTML = `
        <h2>${note.title}</h2>
        <p><strong>Course:</strong> ${note.course}</p>
        <p><strong>Summary:</strong> ${note.summary}</p>
        <nav style="margin-top: 1rem;">
            <a href="#create" role="button">Edit</a>
            <button type="button" class="secondary" onclick="deleteNote(${noteId})">Delete</button>
        </nav>
        <footer style="margin-top: 2rem;">
            <a href="#listing" role="button">← Back to Listing</a>
        </footer>
    `;
}

// Delete note
function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        allNotes = allNotes.filter(note => note.id !== noteId);
        filteredNotes = [...allNotes];
        currentPage = 1;
        renderNotes();
        detailSection.innerHTML = '<p>Note deleted. Select a note to view details.</p>';
    }
}

// Handle create form submission
createForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const course = document.getElementById('course').value.trim();
    const title = document.getElementById('title').value.trim();
    const summary = document.getElementById('summary').value.trim();

    if (!course || !title || !summary) {
        alert('Please fill in all fields.');
        return;
    }

    const newNote = {
        id: Date.now(),
        course,
        title,
        summary,
        date: new Date().toISOString()
    };

    allNotes.unshift(newNote);
    filteredNotes = [...allNotes];
    createForm.reset();
    currentPage = 1;
    renderNotes();
    alert('Note added successfully!');
});

// Initialize
fetchNotes();