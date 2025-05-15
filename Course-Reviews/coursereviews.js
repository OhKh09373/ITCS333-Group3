document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('review-container');
    const sortSelect = document.getElementById('sort-select');
    const departmentFilter = document.getElementById('departmentFilter');
    const searchInput = document.getElementById('searchInput');
    const paginationContainer = document.querySelector('.pagination');
    const form = document.getElementById('review-form');
    const cardsPerPage = 6;
    let currentPage = 1;
    let allData = [];


    function sortReviews(reviews, sortValue) {
        let sortedReviews = [...reviews];
        switch (sortValue) {
            case 'oldest': return sortedReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'newest': return sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'highRating': return sortedReviews.sort((a, b) => b.rating - a.rating);
            case 'lowRating': return sortedReviews.sort((a, b) => a.rating - b.rating);
            default: return sortedReviews;
        }
    }

    function filterReviews(reviews, selectedPrefix) {
        if (selectedPrefix) {
            return reviews.filter(review => review.cid.toUpperCase().startsWith(selectedPrefix));
        }
        return reviews;
    }

    function searchReviews(reviews, searchTerm) {
        const term = searchTerm.toLowerCase();
        return reviews.filter(review =>
            (review.cid || '').toLowerCase().includes(term) ||
            (review.drname || '').toLowerCase().includes(term) ||
            (review.review || '').toLowerCase().includes(term) ||
            (review.grade || '').toLowerCase().includes(term)
        );
    }

    function renderReviews(reviews) {
        container.innerHTML = '';
        const start = (currentPage - 1) * cardsPerPage;
        const end = start + cardsPerPage;
        const paginatedReviews = reviews;

        paginatedReviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-id', review.id);
            card.innerHTML = `
                        <div class="card-toolbar">
                            <div class="toolbar-left">
                                <a href="ReviewComment.html?id=${review.id}"><i class="fa-regular fa-comments"></i></a>
                            </div>
                            <div class="toolbar-right">
                                <a href="#"><i class="fa-solid fa-pen-to-square"></i></a>
                                <a href="#"><i class="fa-solid fa-trash"></i></a>
                            </div>
                        </div>
                        <div class="card-container">
                    <h3>${review.cid}</h3>
                    <p><strong>Doctor Name:</strong> ${review.drname}</p>
                    <p><strong>Rating:</strong> ${review.rating} / 5</p>
                    <p><strong>Grade:</strong> ${review.grade}</p>
                    <div class="review">
                        <p><strong>Review:</strong><br>${review.review}</p>
                    </div>
                    <div class="review-date">
                        <p style="font-size: 0.85rem; color: gray; text-align: left; margin-top: 10px;">
                           Posted on: ${new Date(review.date).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' })}
                        </p>
                    </div>
                </div>
            `;

            // زر الحذف
            const deleteBtn = card.querySelector('.fa-trash');
            deleteBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const confirmed = confirm("Are you sure you want to delete this review?");
                if (!confirmed) return;

                const reviewId = card.getAttribute('data-id');

                try {
                    const response = await fetch('https://e7587148-fd48-4c47-a21c-b81d0adbb7df-00-1p0capn7vcl4e.pike.replit.dev/api.php', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `id=${reviewId}`
                    });

                    if (!response.ok) throw new Error('Delete failed');
                    alert("Review deleted successfully.");
                    await fetchReviews();
                } catch (error) {
                    alert("Error deleting review: " + error.message);
                }
            });

            // زر التعديل
            const editBtn = card.querySelector('.fa-pen-to-square');
            editBtn.addEventListener('click', () => {
                const reviewId = card.getAttribute('data-id');
                const selectedReview = allData.find(r => r.id == reviewId);
                if (!selectedReview) return;

                document.getElementById('id').value = selectedReview.cid;
                document.getElementById('doctorname').value = selectedReview.drname;
                document.getElementById('rate').value = selectedReview.rating;
                document.getElementById('grade').value = selectedReview.grade || '';
                document.getElementById('review').value = selectedReview.review;

                form.setAttribute('data-edit-id', selectedReview.id);
                document.getElementById('popupwindow').style.display = 'block';
            });

            container.appendChild(card);
        });
    }

    function renderPagination(totalPages) {
        paginationContainer.innerHTML = '';

        const prevButton = document.createElement('a');
        prevButton.href = '#';
        prevButton.innerHTML = '&laquo;';
        prevButton.classList.toggle('disabled', currentPage === 1);
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchReviews();
            }
        });

        paginationContainer.appendChild(prevButton);

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('a');
            pageButton.href = '#';
            pageButton.textContent = i;
            if (i === currentPage) pageButton.classList.add('active');
            pageButton.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                fetchReviews();
            });
            paginationContainer.appendChild(pageButton);
        }

        const nextButton = document.createElement('a');
        nextButton.href = '#';
        nextButton.innerHTML = '&raquo;';
        nextButton.classList.toggle('disabled', currentPage === totalPages);
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                fetchReviews();
            }
        });

        paginationContainer.appendChild(nextButton);
    }

    function updateDisplay() {
        let filtered = filterReviews(allData, departmentFilter.value.toUpperCase());
        let searched = searchReviews(filtered, searchInput.value);
        let sorted = sortReviews(searched, sortSelect.value);

        const totalPages = Math.ceil(sorted.length / cardsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        renderReviews(sorted);
        renderPagination(totalPages);
    }
    async function fetchReviews() {
         const loadingSpinner = document.getElementById('loading-spinner');
    try {
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        const url = new URL('https://e7587148-fd48-4c47-a21c-b81d0adbb7df-00-1p0capn7vcl4e.pike.replit.dev/api.php');
        url.searchParams.append('page', currentPage);
        url.searchParams.append('limit', cardsPerPage);
        
        if (departmentFilter.value) {
            url.searchParams.append('department', departmentFilter.value);
        }

       const response = await fetch(url);
       const json = await response.json();
       console.log(json); 
       const { data, pagination = {} } = json;
       const totalPages = pagination.total_pages;
        allData = data; 
        renderPagination(totalPages);
        renderReviews(allData);
        } catch (error) {
        console.error('Failed to fetch reviews:', error);
        container.innerHTML = '<p style="color:red;">Error loading reviews</p>';
        } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
    }

    fetchReviews();
    sortSelect.addEventListener('change', () => {
        currentPage = 1;
        updateDisplay();
    });

    departmentFilter.addEventListener('change', () => {
        currentPage = 1;
        updateDisplay();
    });

    searchInput.addEventListener('input', () => {
        currentPage = 1;
        updateDisplay();
    });

        async function submitReview(event) {
        event.preventDefault();
        clearErrors();
        if (!validateForm()) return;

        const reviewData = {
            cid: document.getElementById('id').value.trim(),
            drname: document.getElementById('doctorname').value.trim(),
            rating: parseInt(document.getElementById('rate').value),
            grade: document.getElementById('grade').value.trim() || null,
            review: document.getElementById('review').value.trim()
        };

        if (!reviewData.cid || !reviewData.drname || isNaN(reviewData.rating) || !reviewData.review) {
            alert("Please fill all required fields!");
            return;
        }

        const editId = form.getAttribute('data-edit-id');
        const method = editId ? 'PUT' : 'POST';
        const payload = editId ? { ...reviewData, id: editId } : reviewData;

        try {
            const response = await fetch('https://e7587148-fd48-4c47-a21c-b81d0adbb7df-00-1p0capn7vcl4e.pike.replit.dev/api.php', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Submission failed');
            }

            alert(editId ? '✅ Review updated successfully!' : '✅ Review added successfully!');
            await fetchReviews();
            document.getElementById('popupwindow').style.display = 'none';
            form.removeAttribute('data-edit-id');
            form.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        }
    }
//(Form Validation)

function validateForm() {
    const courseId = document.getElementById('id');
    const doctorName = document.getElementById('doctorname');
    const rating = document.getElementById('rate');
    const reviewText = document.getElementById('review');

    clearErrors();

    let isValid = true;

    if (courseId.value.trim() === '') {
        showError(courseId, 'Course ID is required.');
        isValid = false;
    }
    if (doctorName.value.trim() === '') {
        showError(doctorName, 'Doctor name is required.');
        isValid = false;
    }
    if (rating.value.trim() === '' || isNaN(rating.value) || rating.value < 1 || rating.value > 5) {
        showError(rating, 'Rating must be a number between 1 and 5.');
        isValid = false;
    }
    if (reviewText.value.trim() === '') {
        showError(reviewText, 'Review cannot be empty.');
        isValid = false;
    }
    return isValid;
}

function showError(inputElement, message) {
    const error = document.createElement('small');
    error.style.color = 'red';
    error.textContent = message;
    inputElement.parentElement.appendChild(error);
}

const reviewForm = document.getElementById('review-form');
    function clearErrors() {
        const errors = reviewForm.querySelectorAll('small');
        errors.forEach(error => error.remove());
    }
form.addEventListener('submit', submitReview);

});