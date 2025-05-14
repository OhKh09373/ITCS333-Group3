function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Fetch News Details
async function fetchNewsDetails() {
    const id = getQueryParam('id');
    if (!id) return alert('Error: Missing news ID');

    try {
        const response = await fetch('https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev/news.php');
        const data = await response.json();

        const news = data.data.find(item => item.id == id);
        if (!news) return alert('News not found');

        displayNewsDetails(news);
        fetchComments(id);
    } catch (error) {
        alert('Error fetching news: ' + error.message);
    }
}

function displayNewsDetails(news) {
    const baseUrl = 'https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev';

    document.getElementById('news-title').textContent = news.title;
    document.getElementById('news-date').textContent = `Published on: ${new Date(news.publish_date).toLocaleDateString()}`;
    document.getElementById('news-image').src = news.image_url ? baseUrl + news.image_url : `https://picsum.photos/id/${news.id}/800/400`;
    document.getElementById('news-short-desc').textContent = news.short_desc || '';

    const categoryElement = document.getElementById('news-category');
    categoryElement.textContent = news.category;
    categoryElement.className = `news-category category-${news.category.toLowerCase().replace(/\s+/g, '-')}`;

    document.getElementById('news-content').innerHTML = `
        <p><strong>Details</strong></p>
        <p>${news.body}</p>
    `;
}

// Edit & Delete Buttons
document.querySelector('.edit').addEventListener('click', () => {
    const id = getQueryParam('id');
    if (id) window.location.href = `form.html?id=${id}`;
});

document.querySelector('.delete').addEventListener('click', async () => {
    const id = getQueryParam('id');
    if (!id) return alert('Missing news ID');

    if (confirm('Are you sure you want to delete this news?')) {
        try {
            const response = await fetch(`https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev/deleteNews.php?id=${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (!response.ok) return alert('Error: ' + result.error);

            alert('News deleted successfully!');
            window.location.href = 'news.html';
        } catch (error) {
            alert('Failed to delete news: ' + error.message);
        }
    }
});

// Comments Submission
const commentForm = document.querySelector('.comment-form');
const commentsContainer = document.querySelector('.comments-container');

commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const commentContent = commentForm.querySelector('textarea').value.trim();
    let nameInput = commentForm.querySelector('input[name="commenter_name"]');

    if (!nameInput && commentContent) {
        nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'commenter_name';
        nameInput.placeholder = 'Your name (optional)';
        nameInput.style.marginTop = '10px';
        commentForm.insertBefore(nameInput, commentForm.querySelector('button'));
        nameInput.focus();
        return;
    }

    if (!commentContent) return alert('Please enter a comment.');

    const commenterName = nameInput ? nameInput.value.trim() : '';
    const newsId = getQueryParam('id');
    if (!newsId) return alert('Missing news ID');

    const formData = new FormData();
    formData.append('news_id', newsId);
    formData.append('name', commenterName);
    formData.append('comment', commentContent);

    try {
        const response = await fetch('https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev/comment.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Error response:', err);
            return alert('Failed to post comment.');
        }

        const result = await response.json();

        addCommentToUI({ name: commenterName || 'Anonymous', comment: commentContent, created_at: new Date().toISOString() });
        commentForm.querySelector('textarea').value = '';
        if (nameInput) nameInput.remove();
    } catch (error) {
        alert('Failed to post comment: ' + error.message);
    }
});

// Fetch Comments for News
async function fetchComments(newsId) {
    try {
        const response = await fetch(`https://b985a6a4-55e3-4045-bab2-a083ed302801-00-urmriyymfbbg.pike.replit.dev/comment.php?news_id=${newsId}`);
        if (!response.ok) {
            const err = await response.text();
            console.error('Fetch comments error:', err);
            throw new Error('Failed to load comments');
        }

        const data = await response.json();
        commentsContainer.innerHTML = '';
        data.data.forEach(comment => {
            addCommentToUI(comment);
        });
    } catch (error) {
        console.error('Failed to load comments:', error.message);
    }
}

// Add Comment to UI
function addCommentToUI(comment) {
    const el = document.createElement('div');
    el.className = 'comment';
    el.innerHTML = `
        <div class="comment-avatar"></div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-author">${comment.name || 'Anonymous'}</span>
                <span class="comment-timestamp">• ${comment.created_at ? new Date(comment.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</span>
            </div>
            <p>${comment.comment}</p>
        </div>
    `;
    commentsContainer.appendChild(el);
}

fetchNewsDetails();
