const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const voter_id = document.getElementById('voter-id').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch(`http://10.0.0.99:8000/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voter_id, password }),
    });

    if (response.ok) {
      const data = await response.json();
      alert("Registration successful! You can now log in.");
      window.location.replace('/');
    } else {
      const errorData = await response.json();
      alert("Registration failed: " + (errorData.detail || "Unknown error"));
    }
  } catch (error) {
    console.error('Signup error:', error);
    alert("An error occurred during registration. Please try again.");
  }
});
