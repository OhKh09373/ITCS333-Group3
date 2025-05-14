document.addEventListener('DOMContentLoaded', () => {
  const groupId = new URLSearchParams(window.location.search).get('id');
  const API_BASE = 'https://51d46a5b-bcbc-4de5-8e6d-10e6737ac545-00-2qupdl9b1aqfv.pike.replit.dev/api/study-groups';

  // DOM Elements
  const groupName = document.getElementById('group-name-display');
  const groupImage = document.getElementById('group-main-image');
  const course = document.getElementById('course-display');
  const creationDate = document.querySelector('.group-creation-date');
  const description = document.getElementById('group-description-display');
  const meetingDay = document.getElementById('meeting-day');
  const meetingMonth = document.getElementById('meeting-month');
  const meetingTime = document.getElementById('meeting-time-display');
  const meetingLocation = document.getElementById('meeting-location-display');
  const contact = document.getElementById('contact-display');
  const maxMembers = document.getElementById('max-members-display');
  const commentsContainer = document.querySelector('.review-list');
  const commentInput = document.getElementById('content');
  const submitButton = document.querySelector('.submit-review');
  const deleteButton = document.querySelector('.delete-button');
  const editButton = document.querySelector('.edit-button');

  // Load group data
  fetch(`${API_BASE}/group.php?id=${groupId}`)
    .then(res => res.json())
    .then(group => {
      groupName.textContent = group.name;
      groupImage.src = group.image_url || 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300';
      course.textContent = group.course;
      creationDate.textContent = `Created: ${new Date(group.created_at).toLocaleDateString()}`;
      description.textContent = group.description;
      contact.textContent = `Email: ${group.contact}`;
      maxMembers.textContent = group.max_members;

      const now = new Date();
      meetingDay.textContent = now.getDate();
      meetingMonth.textContent = now.toLocaleString('default', { month: 'short' });
      meetingTime.textContent = `${group.meeting_day}, ${group.meeting_time}`;
      meetingLocation.textContent = group.location;
    })
    .catch(err => {
      console.error('Failed to load group', err);
      alert('Failed to load group info.');
    });

  // Load comments
  function loadComments() {
    fetch(`${API_BASE}/comments.php?group_id=${groupId}`)
      .then(res => res.json())
      .then(data => {
        commentsContainer.innerHTML = ''; // Clear existing comments
        data.forEach(comment => {
          const item = document.createElement('div');
          item.className = 'review-item';
          item.innerHTML = `
            <img src="black.jpg" alt="User" class="review-avatar">
            <div class="review-content">
              <div class="review-header">
                <span class="review-date">${new Date(comment.created_at).toLocaleDateString()}</span>
              </div>
              <p class="review-text">${comment.content}</p>
            </div>
          `;
          commentsContainer.appendChild(item);
        });
      })
      .catch(err => console.error('Error loading comments', err));
  }

  // Submit comment
  submitButton.addEventListener('click', async () => {
    const content = commentInput.value.trim();
    if (!content) return alert('Please write a comment first');

    try {
      const res = await fetch(`${API_BASE}/comments.php?group_id=${groupId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to submit');

      // Add comment immediately to UI
      const now = new Date();
      const item = document.createElement('div');
      item.className = 'review-item';
      item.innerHTML = `
        <img src="black.jpg" alt="User" class="review-avatar">
        <div class="review-content">
          <div class="review-header">
            <span class="review-date">${now.toLocaleDateString()}</span>
          </div>
          <p class="review-text">${content}</p>
        </div>
      `;
      commentsContainer.prepend(item);
      
      commentInput.value = ''; // Clear input
    } catch (err) {
      console.error('Comment error:', err);
      alert('Failed to submit comment. Please try again.');
    }
  });

  // Delete group
  deleteButton.addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/group.php?id=${groupId}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Failed to delete group');
      
      alert('Group deleted successfully');
      window.location.href = 'SGF.html';
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete group');
    }
  });

  // Edit group - redirect to edit page
  editButton.addEventListener('click', () => {
    window.location.href = `SGEdit.html?id=${groupId}`;
  });

  // Initial load
  loadComments();
});