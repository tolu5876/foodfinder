document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const loginemail = document.getElementById('email');
  const loginpassword = document.getElementById('password');
  const emailError = document.getElementById('error-email');
  const passwordError = document.getElementById('error-password');
  const alertBox = document.getElementById('loginAlert');

  // Helper to show alerts (type = "success" or "error")
  function showAlert(message, duration = 3000, type = "error") {
    const alertDiv = alertBox.querySelector("div");
    if (!alertDiv) return;

    alertDiv.textContent = message;

    // Remove previous alert classes
    alertBox.classList.remove("alert-danger", "alert-success");

    // Add class based on type and set background color
    if (type === "success") {
      alertBox.classList.add("alert-success"); // green alert
      alertBox.style.backgroundColor = "#27ae60"; // Green background
      alertBox.style.color = "#ffffff"; // White text
    } else {
      alertBox.classList.add("alert-danger"); // red alert
      alertBox.style.backgroundColor = "#e74c3c"; // Red background
      alertBox.style.color = "#ffffff"; // White text
    }

    alertBox.style.display = "flex";

    if (duration > 0) {
      setTimeout(() => {
        alertBox.style.display = "none";
      }, duration);
    }
  }

  // Show error on blur
  loginemail.addEventListener('blur', () => {
    const value = loginemail.value.trim();
    if (!value) {
      emailError.textContent = 'Email or phone is required';
      emailError.style.display = 'block';
    } else {
      emailError.style.display = 'none';
    }
  });

  loginpassword.addEventListener('blur', () => {
    passwordError.style.display = loginpassword.value.trim() ? 'none' : 'block';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = loginemail.value.trim();
    const password = loginpassword.value.trim();
    let valid = true;

    // Required field validation
    if (!email) {
      emailError.textContent = 'Email or phone is required';
      emailError.style.display = 'block';
      valid = false;
    } else {
      emailError.style.display = 'none';
    }

    if (!password) {
      passwordError.style.display = 'block';
      valid = false;
    } else {
      passwordError.style.display = 'none';
    }

    if (!valid) {
      showAlert("Please fill in all fields!", 3000, "error");
      return;
    }

    // -------------------------
    // LOGIN CHECK (using backend auth system)
    // -------------------------
    // Check if user is already logged in
    if (typeof isLoggedIn === 'function') {
      isLoggedIn().then(alreadyLoggedIn => {
        if (alreadyLoggedIn) {
          showAlert("You are already logged in!", 2000, "success");
          setTimeout(() => {
            window.location.href = "Dashboard.html";
          }, 1500);
          return;
        }

        // Attempt login using backend auth system
        performLogin(email, password);
      });
    } else {
      // Fallback if auth system not loaded
      showAlert("Authentication system not loaded. Please refresh the page.", 3000, "error");
    }
  });

  // Separate function for login attempt
  async function performLogin(email, password) {
    // Show loading state
    const submitBtn = form.querySelector('.login-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      // Use Firebase login
      if (typeof window.loginUser === 'function') {
        const loginResult = await window.loginUser(email, password);
        
        if (loginResult.success) {
          showAlert("Login successful!", 1000, "success");
          setTimeout(() => {
            window.location.href = "Dashboard.html";
          }, 1000);
        } else {
          // Show specific error messages
          if (loginResult.message.includes('password')) {
            showAlert("Incorrect password! Please try again.", 3000, "error");
          } else if (loginResult.message.includes('user') || loginResult.message.includes('email')) {
            showAlert("User not found! Please check your email or register.", 3000, "error");
          } else if (loginResult.message.includes('too many')) {
            showAlert("Too many login attempts. Please try again later.", 3000, "error");
          } else {
            showAlert(loginResult.message || "Login failed! Please try again.", 3000, "error");
          }
        }
      } else {
        showAlert("Authentication system not available. Please refresh the page.", 3000, "error");
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert("Login failed. Please try again.", 3000, "error");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
});
