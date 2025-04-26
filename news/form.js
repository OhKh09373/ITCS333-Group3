document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    const titleInput = document.getElementById('title');
    const categorySelect = document.getElementById('category');
    const shortDescTextarea = document.getElementById('short-desc');
    const detailsTextarea = document.getElementById('details');

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // prevent form from submitting
        
        // Clear previous error styles
        [titleInput, categorySelect, shortDescTextarea, detailsTextarea].forEach(input => {
            input.style.borderColor = '#ddd';
        });

        let isValid = true;

        // Title validation
        if (titleInput.value.trim() === '') {
            titleInput.style.borderColor = 'red';
            isValid = false;
        }

        // Category validation (make sure user actually picks a category)
        if (categorySelect.value === 'Select a category') {
            categorySelect.style.borderColor = 'red';
            isValid = false;
        }

        // Short description validation
        if (shortDescTextarea.value.trim() === '') {
            shortDescTextarea.style.borderColor = 'red';
            isValid = false;
        }

        // Details validation
        if (detailsTextarea.value.trim() === '') {
            detailsTextarea.style.borderColor = 'red';
            isValid = false;
        }

        if (isValid) {
            alert('Form is valid! Ready to submit.');
       
        } else {
            alert('Please fill all required fields correctly.');
        }
    });
});

