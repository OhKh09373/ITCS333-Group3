document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form');
    const id = new URLSearchParams(window.location.search).get('id');

    // ✅ Load existing news data if in edit mode
    if (id) {
        fetch('https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev/news.php')
            .then(res => res.json())
            .then(data => {
                const news = data.data.find(item => item.id == id);
                if (news) {
                    document.getElementById('title').value = news.title;
                    document.getElementById('category').value = news.category;
                    document.getElementById('short-desc').value = news.short_desc || '';
                    document.getElementById('details').value = news.body;
                }
            })
            .catch(err => console.error('Error loading news:', err));
    }

    // ✅ Form submit handler (Add or Update)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const category = document.getElementById('category').value.trim();
        const shortDesc = document.getElementById('short-desc').value.trim();
        const details = document.getElementById('details').value.trim();
        const imageFile = document.getElementById('image').files[0];

        // ✅ Validation
        if (!title || !category || !details || !shortDesc) {
            alert('Please fill in all required fields.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('short_desc', shortDesc);
        formData.append('body', details);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (id) {
            formData.append('id', id); // Add id for update
        }

        const url = id
            ? 'https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev/updateNews.php'
            : 'https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev/news-upload.php';

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                alert('Error: ' + result.error);
                return;
            }

            alert(id ? 'News updated successfully!' : 'News added successfully!');
            window.location.href = `details1.html?id=${id || result.id}`;

        } catch (error) {
            console.error(error);
            alert('Failed to submit news.');
        }
    });
});
