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

const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    showToast('Passwords do not match!', 'warning');
    return;
  }

  try {
    const response = await fetch(`https://call.ratul.fun/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voter_id, password }),
    });

    if (response.ok) {
      await response.json();
      showToast('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.replace('/');
      }, 800);
    } else {
      const errorData = await response.json();
      showToast('Registration failed: ' + (errorData.detail || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showToast('An error occurred during registration. Please try again.', 'error');
  }
});
