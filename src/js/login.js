function ensureToastContainer() {
  if (!document.getElementById('toastContainer')) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info') {
  ensureToastContainer();
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 3800);
}

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  const token = voter_id;

  const headers = {
    'method': 'GET',
    'Authorization': `Bearer ${token}`,
  };

  fetch(`https://call.ratul.fun/login?voter_id=${voter_id}&password=${password}`, { headers })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Login failed');
      }
    })
    .then(data => {
      if (data.role === 'admin') {
        localStorage.setItem('jwtTokenAdmin', data.token);
        showToast('Login successful. Redirecting to admin dashboard...', 'success');
        setTimeout(() => {
          window.location.replace(`/admin.html?Authorization=Bearer ${localStorage.getItem('jwtTokenAdmin')}`);
        }, 800);
      } else if (data.role === 'user') {
        localStorage.setItem('jwtTokenVoter', data.token);
        showToast('Login successful. Redirecting to voter dashboard...', 'success');
        setTimeout(() => {
          window.location.replace(`/index.html?Authorization=Bearer ${localStorage.getItem('jwtTokenVoter')}`);
        }, 800);
      } else {
        showToast('Login failed. Invalid role returned.', 'error');
      }
    })
    .catch(error => {
      console.error('Login failed:', error.message);
      showToast('Login failed. Check your credentials and try again.', 'error');
    });
});
