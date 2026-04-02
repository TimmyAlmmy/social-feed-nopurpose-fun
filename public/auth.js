// public/auth.js
async function signup() {
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const msgDiv = document.getElementById('signup-msg');

    const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    msgDiv.textContent = data.message;
    msgDiv.style.color = res.status === 200 ? 'green' : 'red';
    if (res.status === 200) {
        setTimeout(() => window.location.href = '/login', 1500);
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const msgDiv = document.getElementById('login-msg');

    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    msgDiv.textContent = data.message;
    msgDiv.style.color = res.status === 200 ? 'green' : 'red';
    if (res.status === 200) setTimeout(() => window.location.href = '/feed', 1000);
}