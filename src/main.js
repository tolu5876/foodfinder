
// Populate countries
const countries = ["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia",
"Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados",
"Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Brazil","Canada",
"China","France","Germany","Ghana","India","Italy","Japan","Kenya",
"Nigeria","South Africa","United Kingdom","United States","Zimbabwe"];
const select = document.getElementById("countrySelect");
countries.forEach(country => {
  const option = document.createElement("option");
  option.value = country;
  option.textContent = country;
  select.appendChild(option);
});

// Toggle password
function togglePassword() {
  const pwd = document.getElementById("password");
  pwd.type = pwd.type === "password" ? "text" : "password";
}

// Password strength
const strengthText = document.getElementById("passwordStrength");
document.getElementById("password").addEventListener("input", function() {
  const val = this.value;
  if(val.length < 8){ strengthText.textContent="Weak"; strengthText.style.color="red"; }
  else if(/[A-Z]/.test(val) && /[0-9]/.test(val)){ strengthText.textContent="Strong"; strengthText.style.color="green";}
  else{ strengthText.textContent="Medium"; strengthText.style.color="orange";}
});

// Form submit
const form = document.getElementById("myForm");
const successAlert = document.getElementById("successAlert");
const usedEmails = ["test@gmail.com","admin@gmail.com"];

form.addEventListener("submit", function(e){
  e.preventDefault();
  let isValid = true;

  const firstname = document.getElementById("Firstname").value.trim();
  const lastname = document.getElementById("Lastname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("DOB").value.trim();
  const country = document.getElementById("countrySelect").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validation
  if(firstname===""){showError("error-firstname","First name required");isValid=false;} else hideError("error-firstname");
  if(lastname===""){showError("error-lastname","Last name required");isValid=false;} else hideError("error-lastname");
  const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(email===""){showError("error-email","Email required");isValid=false;}
  else if(!emailPattern.test(email)){showError("error-email","Enter valid email");isValid=false;}
  else if(usedEmails.includes(email.toLowerCase())){showError("error-email","Email already registered");isValid=false;}
  else hideError("error-email");
  const phonePattern=/^[0-9]{10,15}$/;
  if(phone===""){showError("error-dob","Phone required");isValid=false;}
  else if(!phonePattern.test(phone)){showError("error-dob","Enter valid phone");isValid=false;}
  else hideError("error-dob");
  if(country===""){showError("error-country","Please select a country");isValid=false;} else hideError("error-country");
  if(password===""){showError("error-password","Password required");isValid=false;}
  else if(password.length<8){showError("error-password","Password min 8 chars");isValid=false;}
  else hideError("error-password");
  if(confirmPassword===""){showError("error-confirm","Confirm password");isValid=false;}
  else if(confirmPassword!==password){showError("error-confirm","Passwords do not match");isValid=false;}
  else hideError("error-confirm");

  // Show alert only after pressing register and all fields valid
  if(isValid){
    const successAlert = document.getElementById("successAlert");
    successAlert.style.display = "flex"; // show alert
    setTimeout(() => { successAlert.style.display = "none";window.location.href = 'logino.html';
    },300); // hide after 30s
    form.reset();
  }


});

// Helper functions
function showError(id,msg){const el=document.getElementById(id);el.textContent=msg;el.style.display="block";}
function hideError(id){document.getElementById(id).style.display="none";}

