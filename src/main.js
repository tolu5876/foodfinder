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

const countrySelect = document.getElementById("countrySelect");
countries.forEach(country => {
  const option = document.createElement("option");
  option.value = country;
  option.textContent = country;
  countrySelect.appendChild(option);
});

// ----------------------------
// Toggle password visibility
// ----------------------------
function togglePassword() {
  const pwd = document.getElementById("password");
  pwd.type = pwd.type === "password" ? "text" : "password";
}

// ----------------------------
// Password strength indicator
// ----------------------------
const strengthText = document.getElementById("passwordStrength");
document.getElementById("password").addEventListener("input", function() {
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

  // ----------------------------
  // Success handling
  // ----------------------------
  if(isValid){
    // Get gender value
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    let selectedGender = '';
    genderRadios.forEach(radio => {
      if (radio.checked) {
        selectedGender = radio.value;
      }
    });

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

// ----------------------------
// Helper functions
// ----------------------------
function showError(id, msg){
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = "block";
}

function hideError(id){
  const el = document.getElementById(id);
  el.style.display = "none";
}
