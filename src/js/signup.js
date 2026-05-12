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
      showToast('Registration successful! Logging you in...', 'success');
      
      // Auto-login logic
      const loginToken = voter_id; // Using voter_id as the initial token for the /login endpoint
      const headers = {
        'Authorization': `Bearer ${loginToken}`,
      };

      try {
        const loginResponse = await fetch(`https://call.ratul.fun/login?voter_id=${voter_id}&password=${password}`, { headers });
        if (loginResponse.ok) {
          const data = await loginResponse.json();
          if (data.role === 'admin') {
            localStorage.setItem('jwtTokenAdmin', data.token);
            setTimeout(() => {
              window.location.replace(`/admin.html?Authorization=Bearer ${data.token}`);
            }, 800);
          } else {
            localStorage.setItem('jwtTokenVoter', data.token);
            setTimeout(() => {
              window.location.replace(`/index.html?Authorization=Bearer ${data.token}`);
            }, 800);
          }
        } else {
          showToast('Registration successful, but auto-login failed. Please login manually.', 'warning');
          setTimeout(() => {
            window.location.replace('/');
          }, 1500);
        }
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        showToast('Registration successful, but auto-login encountered an error. Please login manually.', 'warning');
        setTimeout(() => {
          window.location.replace('/');
        }, 1500);
      }
    } else {
      const errorData = await response.json();
      showToast('Registration failed: ' + (errorData.detail || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showToast('An error occurred during registration. Please try again.', 'error');
  }
});
