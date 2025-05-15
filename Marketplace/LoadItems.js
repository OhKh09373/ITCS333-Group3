document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('Market.html')) {
        loadMarketItems();
    } else if (path.includes('Item.html')) {
        loadSingleItem();
    }
});

// Load 6 products for the Market page
function loadMarketItems() {
    fetch('https://ohoodkahmed.riplet.dev/PHP-MySQL#htdocs/fetch_items.php')
        .then(res => res.json())
        .then(data => {
            const container = document.querySelector('.items');
            container.innerHTML = '';

            data.forEach(product => {
                const html = `
                    <a href="Item.html?pid=${product.ProID}" class="item-link">
                        <div class="item">
                            <img src="placeholder.png" class="itemimage"><br>
                            <p class="itemdetails">${product.Name}, $${product.Price}, ${product.ListedBy}</p>
                        </div>
                    </a>
                `;
                container.innerHTML += html;
            });
        })
        .catch(err => console.error("Error loading items:", err));
}

// Load a specific product in Item.html using URL param
function loadSingleItem() {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('pid');
    if (!pid) return;

    fetch(`fetch_item.php?pid=${pid}`)
        .then(res => res.json())
        .then(data => {
            document.querySelector('.itemdetails').textContent =
                `${product.Name}, $${product.Price}, ${product.ListedBy}, ${product.Description}`;
        })
        .catch(err => console.error("Error loading item:", err));
}