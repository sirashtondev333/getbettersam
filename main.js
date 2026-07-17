 // ---- seed data: replace with comments loaded from your backend ----
  let comments = [
    {
      id: 1,
      name: "Maren O.",
      time: "2 days ago",
      text: "This finally clicked for me after reading your section on closures. Thank you!",
      replies: []
    },
    {
      id: 2,
      name: "Devon K.",
      time: "1 day ago",
      text: "Small typo in the third paragraph — 'recieve' should be 'receive'.",
      replies: [
        { id: 21, name: "Author", time: "23 hours ago", text: "Fixed, thanks for the sharp eyes!" }
      ]
    }
  ];

  let nextId = 100;

  const listEl = document.getElementById('commentList');
  const countEl = document.getElementById('commentCount');
  const formEl = document.getElementById('commentForm');
  const nameInput = document.getElementById('nameInput');
  const textInput = document.getElementById('textInput');
  const errorEl = document.getElementById('formError');

  function initials(name) {
    return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function totalCount() {
    return comments.reduce((sum, c) => sum + 1 + c.replies.length, 0);
  }

  function renderComment(c, isNew) {
    const repliesHtml = c.replies.map(r => `
      <li class="comment">
        <div class="comment__row">
          <div class="comment__avatar">${initials(r.name)}</div>
          <div class="comment__body">
            <div class="comment__meta">
              <span class="comment__name">${escapeHtml(r.name)}</span>
              <span class="comment__time">${escapeHtml(r.time)}</span>
            </div>
            <p class="comment__text">${escapeHtml(r.text)}</p>
          </div>
        </div>
      </li>
    `).join('');

    return `
      <li class="comment ${isNew ? 'comment--new' : ''}" data-id="${c.id}">
        <div class="comment__row">
          <div class="comment__avatar">${initials(c.name)}</div>
          <div class="comment__body">
            <div class="comment__meta">
              <span class="comment__name">${escapeHtml(c.name)}</span>
              <span class="comment__time">${escapeHtml(c.time)}</span>
            </div>
            <p class="comment__text">${escapeHtml(c.text)}</p>
            <button type="button" class="comment__reply-btn" data-reply-for="${c.id}">Reply</button>
            <form class="reply-form" data-reply-form="${c.id}">
              <input type="text" placeholder="Write a reply…" aria-label="Reply to ${escapeHtml(c.name)}">
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
        ${c.replies.length ? `<ul class="replies">${repliesHtml}</ul>` : ''}
      </li>
    `;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render(newestId) {
    listEl.innerHTML = comments.map(c => renderComment(c, c.id === newestId)).join('');
    countEl.textContent = `${totalCount()} comment${totalCount() === 1 ? '' : 's'}`;
    attachListListeners();
  }

  function attachListListeners() {
    listEl.querySelectorAll('[data-reply-for]').forEach(btn => {
      btn.addEventListener('click', () => {
        const form = listEl.querySelector(`[data-reply-form="${btn.dataset.replyFor}"]`);
        form.classList.toggle('is-open');
        if (form.classList.contains('is-open')) form.querySelector('input').focus();
      });
    });

    listEl.querySelectorAll('[data-reply-form]').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const input = form.querySelector('input');
        const value = input.value.trim();
        if (!value) return;

        const parent = comments.find(c => c.id === Number(form.dataset.replyForm));
        parent.replies.push({
          id: nextId++,
          name: "You",
          time: "just now",
          text: value
        });
        render();
      });
    });
  }

  formEl.addEventListener('submit', e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name || !text) {
      errorEl.classList.add('is-visible');
      return;
    }
    errorEl.classList.remove('is-visible');

    const newComment = {
      id: nextId++,
      name,
      time: "just now",
      text,
      replies: []
    };
    comments.unshift(newComment);
    render(newComment.id);

    nameInput.value = '';
    textInput.value = '';
  });

//   render();