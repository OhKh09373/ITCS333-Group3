document.addEventListener('DOMContentLoaded', () => {
  const groupId = new URLSearchParams(window.location.search).get('id');
  const API_BASE = 'https://51d46a5b-bcbc-4de5-8e6d-10e6737ac545-00-2qupdl9b1aqfv.pike.replit.dev/api/study-groups';
  const form = document.getElementById('edit-form');
  const cancelBtn = document.getElementById('cancel-btn');

  // Load existing group data
  fetch(`${API_BASE}/group.php?id=${groupId}`)
    .then(res => res.json())
    .then(group => {
      document.getElementById('group-name').value = group.name;
      document.getElementById('course').value = group.course;
      document.getElementById('description').value = group.description;
      document.getElementById('meeting-day').value = group.meeting_day;
      document.getElementById('meeting-time').value = group.meeting_time;
      document.getElementById('location').value = group.location;
      document.getElementById('max-members').value = group.max_members;
      document.getElementById('contact').value = group.contact;
    })
    .catch(err => {
      console.error('Error loading group:', err);
      alert('Failed to load group data');
    });

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById('group-name').value.trim(),
      course: document.getElementById('course').value.trim(),
      description: document.getElementById('description').value.trim(),
      meeting_day: document.getElementById('meeting-day').value,
      meeting_time: document.getElementById('meeting-time').value,
      location: document.getElementById('location').value.trim(),
      max_members: parseInt(document.getElementById('max-members').value),
      contact: document.getElementById('contact').value.trim(),
      image_url: await handleImageUpload() // Handle image upload
    };

    try {
      const res = await fetch(`${API_BASE}/group.php?id=${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update group');
      }

      alert('Group updated successfully');
      window.location.href = `SG1.html?id=${groupId}`;
    } catch (err) {
      console.error('Update error:', err);
      alert(err.message || 'Failed to update group');
    }
  });

  // Handle image upload (same as in SGFValid.js)
  async function handleImageUpload() {
    const imageFile = document.querySelector('#group-image').files[0];
    if (!imageFile) return null;

    if (imageFile.size > 1000000) {
      alert('Image is too large (max 1MB)');
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
    });
  }

  // Cancel button
  cancelBtn.addEventListener('click', () => {
    window.location.href = `SG1.html?id=${groupId}`;
  });
});