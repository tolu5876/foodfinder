// ----------------------------
// Populate countries
// ----------------------------
const countries = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia",
  "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados",
  "Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Brazil","Canada",
  "China","France","Germany","Ghana","India","Italy","Japan","Kenya",
  "Nigeria","South Africa","United Kingdom","United States","Zimbabwe"
];

document.addEventListener('DOMContentLoaded', function() {
  // Populate countries dropdown
  const countrySelect = document.getElementById("countrySelect");
  if (countrySelect) {
    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
  }

// ----------------------------
// Toggle password visibility
// ----------------------------
function togglePassword(fieldId) {
  const pwd = document.getElementById(fieldId);
  const eyeButton = pwd.parentElement.querySelector('button');
  
  if (pwd.type === "password") {
    pwd.type = "text";
    eyeButton.textContent = "🙈"; // Closed eye
  } else {
    pwd.type = "password";
    eyeButton.textContent = "👁"; // Open eye
  }
}

  // ----------------------------
  // Password strength indicator
  // ----------------------------
  const strengthText = document.getElementById("passwordStrength");
  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("input", function() {
      const val = this.value;
      if(val.length < 8){
        strengthText.textContent = "Weak";
        strengthText.style.color = "red";
      } else if(/[A-Z]/.test(val) && /[0-9]/.test(val)){
        strengthText.textContent = "Strong";
        strengthText.style.color = "green";
      } else {
        strengthText.textContent = "Medium";
        strengthText.style.color = "orange";
      }
    });
  }

  // ----------------------------
  // Form submit handling
  // ----------------------------
  const form = document.getElementById("myForm");
  const successAlert = document.getElementById("successAlert");

  form.addEventListener("submit", function(e){
    e.preventDefault();
    let isValid = true;

    const firstname = document.getElementById("Firstname").value.trim();
    const lastname = document.getElementById("Lastname").value.trim();
    const registeremail = document.getElementById("email").value.trim();
    const phone = document.getElementById("DOB").value.trim();
    const country = countrySelect.value;
    const registerpassword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // ----------------------------
    // Validation
    // ----------------------------
    if(firstname === "") { showError("error-firstname","First name required"); isValid=false; } else hideError("error-firstname");
    if(lastname === "") { showError("error-lastname","Last name required"); isValid=false; } else hideError("error-lastname");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(registeremail === "") { showError("error-email","Email required"); isValid=false; }
    else if(!emailPattern.test(registeremail)) { showError("error-email","Enter valid email"); isValid=false; }
    else hideError("error-email");

    const phonePattern = /^[0-9]{10,15}$/;
    if(phone === "") { showError("error-dob","Phone required"); isValid=false; }
    else if(!phonePattern.test(phone)) { showError("error-dob","Enter valid phone"); isValid=false; }
    else hideError("error-dob");

    if(country === "") { showError("error-country","Please select a country"); isValid=false; } else hideError("error-country");

    if(registerpassword === "") { showError("error-password","Password required"); isValid=false; }
    else if(registerpassword.length < 8) { showError("error-password","Password min 8 chars"); isValid=false; }
    else hideError("error-password");

    if(confirmPassword === "") { showError("error-confirm","Confirm password"); isValid=false; }
    else if(confirmPassword !== registerpassword) { showError("error-confirm","Passwords do not match"); isValid=false; }
    else hideError("error-confirm");

    // Get gender value from select dropdown
    const genderSelect = document.getElementById('gender');
    const selectedGender = genderSelect.value;

    // Validate gender is selected
    if(selectedGender === "") {
      showError("error-gender","Please select your gender");
      isValid = false;
    } else {
      hideError("error-gender");
    }

    // Check terms agreement
    if(!document.getElementById("terms").checked) {
      showError("error-terms","You must agree to the terms");
      isValid = false;
    } else {
      hideError("error-terms");
    }

    if(isValid) {
      // Show loading state
      const submitBtn = form.querySelector('.subt');
      const originalText = submitBtn.value;
      submitBtn.value = 'Registering...';
      submitBtn.disabled = true;

      // Register user using backend auth system
      registerUser({
        first_name: firstname,
        last_name: lastname,
        email: registeremail,
        phone: phone,
        password: registerpassword,
        gender: selectedGender,
        country: country
      }).then(registrationResult => {
        submitBtn.value = originalText;
        submitBtn.disabled = false;

        if (registrationResult.success) {
          // Show success alert
          successAlert.style.display = "flex"; 
          setTimeout(() => { 
            successAlert.style.display = "none"; 
            window.location.href = 'logino.html';
          }, 2000); // 2 seconds

          // Reset the form
          form.reset();
          if (strengthText) strengthText.textContent = "";
        } else {
          // Show error if registration failed
          if (registrationResult.message.includes('email')) {
            showError("error-email", registrationResult.message);
          } else if (registrationResult.message.includes('phone')) {
            showError("error-dob", registrationResult.message);
          } else {
            showError("error-email", registrationResult.message);
          }
          isValid = false;
        }
      }).catch(error => {
        submitBtn.value = originalText;
        submitBtn.disabled = false;
        showError("error-email", "Registration failed. Please try again.");
        console.error('Registration error:', error);
      });
    }
  });
});

// ----------------------------
// Helper functions
// ----------------------------
function showError(id, msg){
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  }
}

function hideError(id){
  const el = document.getElementById(id);
  if (el) {
    el.style.display = "none";
  }
}
