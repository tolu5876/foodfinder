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
      // Inline login with proper password validation
      console.log('Starting inline login for:', email);
      console.log('Password entered:', password);
      
      // Debug: Check what's in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      console.log('All stored users:', storedUsers);
      
      // Check if user exists in localStorage with password
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userExists = existingUsers.find(user => 
        user.email.toLowerCase() === email.toLowerCase()
      );
      
      console.log('Found user:', userExists);
      
      if (!userExists) {
        showAlert("User not found! Please register first.", 3000, "error");
        return;
      }
      
      // Debug password comparison
      console.log('Stored password:', userExists.password);
      console.log('Entered password:', password);
      console.log('Password match:', userExists.password === password);
      
      // Check if password matches (you should store hashed passwords in real apps)
      if (userExists.password !== password) {
        showAlert("Incorrect password! Please try again.", 3000, "error");
        return;
      }
      
      // Create user session
      const user = {
        uid: userExists.uid,
        email: email,
        displayName: userExists.displayName || email.split('@')[0],
        firstName: userExists.firstName,
        lastName: userExists.lastName
      };
      
      // Save session to localStorage
      localStorage.setItem('userSession', JSON.stringify({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          firstName: user.firstName,
          lastName: user.lastName
        },
        deviceId: 'device_' + Date.now()
      }));
      
      console.log('Login successful with correct credentials:', user);
      
      showAlert("Login successful!", 1000, "success");
      setTimeout(() => {
        window.location.href = "Dashboard.html";
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.message && error.message.includes('Maximum call stack')) {
        showAlert("Login system error. Please refresh the page.", 5000, "error");
      } else {
        showAlert("Login failed. Please try again.", 3000, "error");
      }
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }
});
