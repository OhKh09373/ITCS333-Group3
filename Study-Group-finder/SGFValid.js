document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.group-form');
  
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission
  
    const errors = [];
    const groupName = document.getElementById('group-name');
    const course = document.getElementById('course');
    const description = document.getElementById('description');
    const meetingTime = document.getElementById('meeting-time');
    const location = document.getElementById('location');
    const maxMembers = document.getElementById('max-members'); 
    const contact = document.getElementById('contact');
    const image = document.getElementById('group-image');
  
    // Reset previous styles and error messages
    form.querySelectorAll('input, textarea').forEach(field => {
      field.classList.remove('invalid');
      const errorMessage = field.parentNode.querySelector('.error-message');
      if (errorMessage) {
        errorMessage.remove();
      }
    });
  
    // Group Name
    if (groupName.value.trim().length < 3) {
      markInvalid(groupName, 'Group name must be at least 3 characters.');
      errors.push('Group Name');
    }
  
    // Course format: e.g., CS 333 - Internet Software Development
    const coursePattern = /^[A-Z]{4}\d{3}\s*-\s*.+$/;
    if (!coursePattern.test(course.value.trim())) {
      markInvalid(course, 'Course must follow format like "ITCS333 - Course Title".');
      errors.push('Course');
    }
  
    // Description
    if (description.value.trim().length < 10) {
      markInvalid(description, 'Description must be at least 10 characters.');
      errors.push('Description');
    }
  
    // Meeting time
    if (!meetingTime.value) {
      markInvalid(meetingTime, 'Meeting time is required.');
      errors.push('Meeting Time');
    }
  
    // Location
    if (location.value.trim().length < 3) {
      markInvalid(location, 'Please enter a valid location.');
      errors.push('Location');
    }
  
    // Max Members
    if (!maxMembers.value || parseInt(maxMembers.value) <= 0) {
      markInvalid(maxMembers, 'Max members must be greater than 0.');
      errors.push('Max Members');
    }
  
    // Contact Info (email or phone with 8 digits)
    const contactPattern = /^(\+?\d{10,15})|(\d{8})$/; // For 8 digit phone numbers and optional country code
    if (!contactPattern.test(contact.value.trim())) {
      markInvalid(contact, 'Enter a valid 8-digit phone number or email.');
      errors.push('Contact');
    }
  
    // Group Image
    if (!image.files || image.files.length === 0) {
      markInvalid(image, 'Please upload an image.');
      errors.push('Image');
    }
  
    if (errors.length === 0) {
      alert('Form is valid! You can now proceed to store or preview this group.');
    }
  });
  
  function markInvalid(field, message) {
    field.classList.add('invalid');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (!errorMessage) {
      const error = document.createElement('small');
      error.className = 'error-message';
      error.style.color = 'red';
      error.textContent = message;
      field.parentNode.appendChild(error);
    } else {
      errorMessage.textContent = message;
    }
  }
  
  // Dynamic validation when user corrects input
  const fields = document.querySelectorAll('.group-form input, .group-form textarea');
  fields.forEach(field => {
    field.addEventListener('input', function () {
      const errorMessage = field.parentNode.querySelector('.error-message');
      if (errorMessage) {
        const errorField = field.id;
        // Check if field is corrected
        if (isValidField(field)) {
          field.classList.remove('invalid');
          errorMessage.remove();
        }
      }
    });
  });

  function isValidField(field) {
    // Check the validity of each field based on the validation logic
    switch (field.id) {
      case 'group-name':
        return field.value.trim().length >= 3;
      case 'course':
        const coursePattern = /^[A-Z]{4}\d{3}\s*-\s*.+$/;
        return coursePattern.test(field.value.trim());
      case 'description':
        return field.value.trim().length >= 10;
      case 'meeting-time':
        return field.value.trim() !== '';
      case 'location':
        return field.value.trim().length >= 3;
      case 'max-members':
        return field.value.trim() !== '' && parseInt(field.value) > 0;
      case 'contact':
        const contactPattern = /^(\+?\d{10,15})|(\d{8})$/; // Validates 8 digit phone number
        return contactPattern.test(field.value.trim());
      case 'group-image':
        return field.files.length > 0;
      default:
        return true;
    }
  }
});
