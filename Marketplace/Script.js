// --- Helper function to get query parameters ---
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  // --- MyListing Page Logic ---
  function loadListings() {
    const listingsContainer = document.querySelector('.items');
    listingsContainer.innerHTML = '';
  
    fetch('listings.json')
      .then(response => response.json())
      .then(listings => {
        const searchQuery = document.getElementById('search-bar').value.toLowerCase();
        const filteredListings = listings.filter(item => {
          const matchesSearch = item.title.toLowerCase().includes(searchQuery);
          return matchesSearch;
        });
  
        filteredListings.slice(0, 6).forEach(item => {
          const listingHTML = `
            <div class="listing-item">
              <a href="ItemDetails.html?item=${item.id}" class="item-link">
                <div class="item">
                  <img src="${item.image}" class="itemimage" alt="${item.title}">
                  <p class="itemdetails">${item.title}, $${item.price}</p>
                </div>
              </a>
              <button class="edit-button" onclick="editItem(${item.id})">Edit</button>
            </div>
          `;
          listingsContainer.innerHTML += listingHTML;
        });
      })
      .catch(error => console.error('Error loading listings:', error));
  }
  
  // --- Redirect to the edit page ---
  function editItem(id) {
    window.location.href = `EditListing.html?item=${id}`;
  }
  
  // --- Edit Listing Page Logic ---
  function loadItemForEditing() {
    const itemId = getQueryParam('item');
  
    fetch('listings.json')
      .then(response => response.json())
      .then(listings => {
        const item = listings.find(listing => listing.id == itemId);
  
        if (item) {
          document.getElementById('listingTitle').value = item.title;
          document.getElementById('listingPrice').value = item.price;
          document.getElementById('listingDescription').value = item.description;
          if (item.negotiable) {
            document.getElementById('negotiableYes').checked = true;
          } else {
            document.getElementById('negotiableNo').checked = true;
          }
  
          document.getElementById('editListingForm').addEventListener('submit', function(event) {
            event.preventDefault();
  
            // Update item values
            item.title = document.getElementById('listingTitle').value;
            item.price = parseFloat(document.getElementById('listingPrice').value);
            item.description = document.getElementById('listingDescription').value;
            item.negotiable = document.getElementById('negotiableYes').checked;
  
            // Simulate saving updated data (in reality, you'd need a backend for this)
            localStorage.setItem('listings', JSON.stringify(listings)); // Store locally in case
            
            alert("Listing updated!");
            window.location.href = 'MyListing.html'; // ✅ Redirect back
          });
        } else {
          alert("Item not found!");
          window.location.href = 'MyListing.html';
        }
      })
      .catch(error => console.error('Error loading listings:', error));
  }
  
  // --- Item Details Page Logic ---
  function loadItemDetails() {
    const itemId = getQueryParam('item');
  
    fetch('listings.json')
      .then(response => response.json())
      .then(listings => {
        const item = listings.find(listing => listing.id == itemId);
  
        if (item) {
          const itemDetailsHTML = `
            <div class="item">
              <img src="${item.image}" class="itemimage" alt="${item.title}">
              <p class="itemdetails">${item.title}</p>
              <p class="itemdetails">Price: $${item.price}</p>
              <p class="itemdetails">${item.description}</p>
              <p class="itemdetails">Negotiable: ${item.negotiable ? 'Yes' : 'No'}</p>
            </div>
          `;
          document.querySelector('.item-details').innerHTML = itemDetailsHTML;
        } else {
          alert("Item not found!");
          window.location.href = 'MyListing.html';
        }
      })
      .catch(error => console.error('Error loading item details:', error));
  }
  
  // --- Handle comment submission ---
  document.getElementById('comment-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const commentText = document.getElementById('comment-input').value;
    
    const commentHTML = `
      <div class="comment">
        <p>${commentText}</p>
      </div>
    `;
    
    document.getElementById('comment-list').innerHTML += commentHTML;
    document.getElementById('comment-input').value = '';
  });
  
  // --- Search and Filter Logic ---
  document.getElementById('search')?.addEventListener('click', function() {
    loadListings();
  });
  
  document.getElementById('filter-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    loadListings();
  });
  
  // --- Calling the appropriate function based on page ---
  if (document.body.contains(document.querySelector('.items'))) {
    window.onload = loadListings;
  } else if (document.body.contains(document.querySelector('#editListingForm'))) {
    window.onload = loadItemForEditing;
  } else if (document.body.contains(document.querySelector('.item-details'))) {
    window.onload = loadItemDetails;
  }
  