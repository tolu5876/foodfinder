document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('error-email');
  const passwordError = document.getElementById('error-password');
  const alertBox = document.getElementById('loginAlert');

  // Show error on blur
  emailInput.addEventListener('blur', () => {
    emailError.style.display = emailInput.value.trim() ? 'none' : 'block';
  });

  passwordInput.addEventListener('blur', () => {
    passwordError.style.display = passwordInput.value.trim() ? 'none' : 'block';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
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

    // If fields are empty → show alert, DO NOT redirect
    if (!valid) {
      alertBox.querySelector("div").textContent = "Please fill in all fields!";
      alertBox.style.display = "flex";

      setTimeout(() => {
        alertBox.style.display = "none";
      }, 3000);

      return;
    }

    // -------------------------
    //  LOGIN CHECK (LOCAL DATA)
    // -------------------------
    const savedEmail = localStorage.getItem("registeredEmail");
    const savedPassword = localStorage.getItem("registeredPassword");

    if (email === savedEmail && password === savedPassword) {
      // SUCCESS → redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      // WRONG CREDENTIALS → show alert only
      alertBox.querySelector("div").textContent = "Incorrect email or password!";
      alertBox.style.display = "flex";

      setTimeout(() => {
        alertBox.style.display = "none";
      }, 3000);
    }
  });
});
