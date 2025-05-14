document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.group-form');
  const API_URL = 'https://51d46a5b-bcbc-4de5-8e6d-10e6737ac545-00-2qupdl9b1aqfv.pike.replit.dev/api/study-groups/index.php';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get form values
    const formData = {
      name: document.querySelector('#group-name').value.trim(),
      course: document.querySelector('#course').value.trim(),
      description: document.querySelector('#description').value.trim(),
      meeting_day: document.querySelector('#meeting-day').value,
      meeting_time: document.querySelector('#meeting-time').value,
      location: document.querySelector('#location').value.trim(),
      max_members: document.querySelector('#max-members').value,
      contact: document.querySelector('#contact').value.trim(),
      image_url: await handleImageUpload() // Handle image upload
    };

    // Validate required fields
    for (const [key, value] of Object.entries(formData)) {
      if (!value && key !== 'image_url') {
        alert(`Please fill in the ${key.replace('_', ' ')} field`);
        return;
      }
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Failed to create group');

      alert('Study group created successfully!');
      window.location.href = `SG1.html?id=${result.group_id}`;
    } catch (err) {
      console.error('Creation error:', err);
      alert(err.message || 'An error occurred while creating the group.');
    }
  });

  // Handle image upload (resize + convert to base64)
  async function handleImageUpload() {
    const imageFile = document.querySelector('#group-image').files[0];
    if (!imageFile) return null;

    // Check file size (max 1MB)
    if (imageFile.size > 1000000) {
      alert('Image is too large (max 1MB)');
      return null;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize image to max 800x800px to reduce base64 size
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

          // Convert to JPEG (smaller than PNG)
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
    });
  }
});