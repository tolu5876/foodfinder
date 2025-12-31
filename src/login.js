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

    // Add class based on type
    if (type === "success") {
      alertBox.classList.add("alert-success"); // green alert
    } else {
      alertBox.classList.add("alert-danger"); // red alert
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
    emailError.style.display = loginemail.value.trim() ? 'none' : 'block';
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
    // LOGIN CHECK (localStorage)
    // -------------------------
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");

    if (!savedEmail || !savedPassword) {
      showAlert("No account found. Please register.", 3000, "error");
      return;
    }

    if (email === savedEmail && password === savedPassword) {
      showAlert("Login successful!", 1000, "success"); // green alert

      setTimeout(() => {
        window.location.href = "Dashboard.html";
      }, 1000);
    } else {
      showAlert("Incorrect email or password!", 3000, "error"); // red alert
    }
  });
});
