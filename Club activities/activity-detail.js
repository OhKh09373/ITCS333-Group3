async function loadActivityDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get('title');

  const detailSection = document.querySelector("main");

  detailSection.innerHTML = `
    <div style="text-align:center; width: 100%;">
      <div class="loader"></div>
      <p>Loading activity details...</p>
    </div>
  `;

  try {
      const response = await fetch("activities.json");
      if (!response.ok) {
          throw new Error("Network error");
      }
      const activities = await response.json();
      const activity = activities.find(act => act.title === title);

      if (!activity) {
          throw new Error("Activity not found");
      }

      detailSection.innerHTML = `
        <article style="padding: 2rem; border: 1px solid #ccc; border-radius: 8px; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); max-width: 600px; margin: 2rem auto;">
          <h1>${activity.title}</h1>
          <p><strong>Club:</strong> ${activity.club}</p>
          <p><strong>Category:</strong> ${activity.category}</p>
          <p><strong>Date:</strong> ${activity.date}</p>
          <p>${activity.description}</p>
          <a href="club.html" class="secondary">← Back to Activities</a>
          <button onclick="editActivity(${activity.id})">Edit</button>
        </article>
      `;
  } catch (error) {
      console.error("Error loading activity:", error);
      detailSection.innerHTML = "<p style='color:red; text-align:center;'>Failed to load activity details. Please try again later.</p>";
  }
}

function editActivity(activityId) {
  const detailSection = document.querySelector("main");

  
  detailSection.innerHTML = `
    <article style="padding: 2rem; border: 1px solid #ccc; border-radius: 8px; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); max-width: 600px; margin: 2rem auto;">
      <h2>Edit Activity</h2>
      <form id="edit-activity-form">
        <label for="edit-title">Title:</label>
        <input type="text" id="edit-title" name="title" required />

        <label for="edit-club">Club:</label>
        <input type="text" id="edit-club" name="club" required />

        <label for="edit-category">Category:</label>
        <input type="text" id="edit-category" name="category" required />

        <label for="edit-date">Date:</label>
        <input type="date" id="edit-date" name="date" required />

        <label for="edit-description">Description:</label>
        <textarea id="edit-description" name="description" required></textarea>

        <button type="submit">Save Changes</button>
        <button type="button" onclick="cancelEdit()">Cancel</button>
      </form>
    </article>
  `;

  
  const activity = activities.find(act => act.id === activityId);
  document.getElementById('edit-title').value = activity.title;
  document.getElementById('edit-club').value = activity.club;
  document.getElementById('edit-category').value = activity.category;
  document.getElementById('edit-date').value = activity.date;
  document.getElementById('edit-description').value = activity.description;

  
  document.getElementById('edit-activity-form').onsubmit = async (event) => {
      event.preventDefault();

      const updatedActivity = {
          title: document.getElementById('edit-title').value,
          club: document.getElementById('edit-club').value,
          category: document.getElementById('edit-category').value,
          date: document.getElementById('edit-date').value,
          description: document.getElementById('edit-description').value
      };

      const response = await fetch(`update-activity.php?id=${activityId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedActivity)
      });

      if (response.ok) {
          alert("Activity updated successfully");
          window.location.href = `activity-detail.html?title=${updatedActivity.title}`; 
      } else {
          alert("Error updating activity");
      }
  };
}

function cancelEdit() {
  
  window.location.href = `activity-detail.html?title=${decodeURIComponent(new URLSearchParams(window.location.search).get('title'))}`;
}

loadActivityDetail();
