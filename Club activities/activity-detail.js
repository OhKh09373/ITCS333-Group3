// activity-detail.js

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
          </article>
        `;
    } catch (error) {
        console.error("Error loading activity:", error);
        detailSection.innerHTML = "<p style='color:red; text-align:center;'>Failed to load activity details. Please try again later.</p>";
    }
}

loadActivityDetail();