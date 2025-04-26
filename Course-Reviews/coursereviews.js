document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('review-container');
    const sortSelect = document.getElementById('sort-select');
    const departmentFilter = document.getElementById('departmentFilter');
    const searchInput = document.getElementById('searchInput');
    const paginationContainer = document.querySelector('.pagination');

    const cardsPerPage = 6;
    let currentPage = 1;
    let allData = [];

    fetch('reviews.json')
        .then(res => res.json())
        .then(data => {
            // Add temporary date if not present
            data.forEach(review => {
                if (!review.date) {
                    const today = new Date();
                    review.date = today.toLocaleString('en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });
                }
            });

            allData = data;
            updateDisplay();

            function sortReviews(reviews, sortValue) {
                let sortedReviews = [...reviews];
                switch (sortValue) {
                    case 'oldest':
                        return sortedReviews.sort((a, b) => new Date(a.date) - new Date(b.date));
                    case 'newest':
                        return sortedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
                    case 'highRating':
                        return sortedReviews.sort((a, b) => b.rating - a.rating);
                    case 'lowRating':
                        return sortedReviews.sort((a, b) => a.rating - b.rating);
                    default:
                        return sortedReviews;
                }
            }

            function filterReviews(reviews, selectedPrefix) {
                if (selectedPrefix) {
                    return reviews.filter(review => review.course.toUpperCase().startsWith(selectedPrefix));
                }
                return reviews;
            }

            function searchReviews(reviews, searchTerm) {
                const term = searchTerm.toLowerCase();
                return reviews.filter(review =>
                    review.course.toLowerCase().includes(term) ||
                    review.doctor.toLowerCase().includes(term) ||
                    review.review.toLowerCase().includes(term) ||
                    review.grade.toLowerCase().includes(term)
                );
            }

            function renderReviews(reviews) {
                container.innerHTML = '';
                const start = (currentPage - 1) * cardsPerPage;
                const end = start + cardsPerPage;
                const paginatedReviews = reviews.slice(start, end);

                paginatedReviews.forEach(review => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <div class="card-toolbar">
                            <div class="toolbar-left">
                                <a href="ReviewComment.html"><i class="fa-regular fa-comments"></i></a>
                            </div>
                            <div class="toolbar-right">
                                <a href="#"><i class="fa-solid fa-pen-to-square"></i></a>
                                <a href="#"><i class="fa-solid fa-trash"></i></a>
                            </div>
                        </div>
                        <div class="card-container">
                            <h3>${review.course}</h3>
                            <p><strong>Doctor Name:</strong> ${review.doctor}</p>
                            <p><strong>Rating:</strong> ${review.rating} / 5</p>
                            <p><strong>Grade:</strong> ${review.grade}</p>
                            <div class="review">
                                <p><strong>Review:</strong><br>${review.review}</p>
                            </div>
                            <div class="review-date">
                                <p style="font-size: 0.85rem; color: gray; text-align: left; margin-top: 10px;">
                                    Posted on: ${review.date}
                                </p>
                            </div>
                        </div>
                    `;
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
                        updateDisplay();
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
                        updateDisplay();
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
                        updateDisplay();
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
        })
        .catch(error => {
            container.innerHTML = '<p style="color:red;">Failed to load reviews.</p>';
            console.error(error);
        });

    //(Form Validation)

    const reviewForm = document.querySelector('#popupwindow form');

    reviewForm.addEventListener('submit', function(event) {
        event.preventDefault();
        validateForm();
    });

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

        if (isValid) {
            alert('✅ Review added successfully!');
            reviewForm.reset();
        }
    }

    function showError(inputElement, message) {
        const error = document.createElement('small');
        error.style.color = 'red';
        error.textContent = message;
        inputElement.parentElement.appendChild(error);
    }

    function clearErrors() {
        const errors = reviewForm.querySelectorAll('small');
        errors.forEach(error => error.remove());
    }

});