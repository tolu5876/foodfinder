const countries = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
            "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
            "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
            "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
            "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China",
            "Colombia", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)", "Costa Rica", "Croatia",
            "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
            "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
            "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
            "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
            "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
            "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya",
            "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
            "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
            "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
            "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
            "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
            "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
            "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
            "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
            "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
            "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
            "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
            "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
            "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
            "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
            "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
            "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
    const select = document.getElementById("countrySelect");
    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      select.appendChild(option);
    });

    function togglePassword() {
      var pwd = document.getElementById('password');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
    }

    const form = document.getElementById("myForm");
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      let isValid = true;

      // Firstname validation
      const firstname = document.getElementById('Firstname').value.trim();
      const firstnameError = document.getElementById('error-firstname');
      if (firstname === '') {
        firstnameError.style.display = 'block';
        isValid = false;
      } else {
        firstnameError.style.display = 'none';
      }

      // Lastname validation
      const lastname = document.getElementById('Lastname').value.trim();
      const lastnameError = document.getElementById('error-lastname');
      if (lastname === '') {
        lastnameError.style.display = 'block';
        isValid = false;
      } else {
        lastnameError.style.display = 'none';
      }

      // Email validation
      const email = document.getElementById('email').value.trim();
      const emailError = document.getElementById('error-email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.style.display = 'block';
        isValid = false;
      } else {
        emailError.style.display = 'none';
      }

      // POST registration to server
      const formData = new FormData();
      formData.append('firstname', firstname);
      formData.append('lastname', lastname);
      formData.append('email', email);
      formData.append('phone', dob);
      const genderEl = document.querySelector('input[name="gender"]:checked');
      formData.append('gender', genderEl ? genderEl.value : '');
      formData.append('country', country);
      formData.append('password', password);

      fetch('register.php', {
        method: 'POST',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          document.getElementById('successAlert').style.display = 'flex';
          setTimeout(function() {
            document.getElementById('successAlert').style.display = 'none';
            window.location.href = 'login.html';
          }, 1500);
        } else {
          alert(data.message || 'Registration failed.');
        }
      })
      .catch(err => {
        alert('Server error. Please try again later.');
      });


      // DOB validation
      const dob = document.getElementById('DOB').value.trim();
      const dobError = document.getElementById('error-dob');
      if (dob === '') {
        dobError.style.display = 'block';
        isValid = false;
      } else {
        dobError.style.display = 'none';
      }

      // Gender validation
      const genderError = document.getElementById('error-gender');
      if (!document.querySelector('input[name="gender"]:checked')) {
        genderError.style.display = 'block';
        isValid = false;
      } else {
        genderError.style.display = 'none';
      }

      // Country validation
      const country = document.getElementById('countrySelect').value;
      const countryError = document.getElementById('error-country');
      if (country === '') {
        countryError.style.display = 'block';
        isValid = false;
      } else {
        countryError.style.display = 'none';
      }

      // Password validation
      const password = document.getElementById('password').value;
      const passwordError = document.getElementById('error-password');
      if (password.length < 8) {
        passwordError.textContent = "Password must be at least 8 characters.";
        passwordError.style.display = 'block';
        isValid = false;
      } else {
        passwordError.style.display = 'none';
      }

      // Confirm Password validation
      const confirmPassword = document.getElementById('confirmPassword').value;
      const confirmError = document.getElementById('error-confirm');
      if (confirmPassword === '') {
        confirmError.textContent = "Please confirm your password.";
        confirmError.style.display = 'block';
        isValid = false;
      } else if (confirmPassword !== password) {
        confirmError.textContent = "Passwords don't match.";
        confirmError.style.display = 'block';
        isValid = false;
      } else {
        confirmError.style.display = 'none';
      }

      // Terms validation (optional)
      const termsError = document.getElementById('error-terms');
      termsError.style.display = 'none';

      if (!isValid) {
        document.getElementById('successAlert').style.display = 'none';
      } else {
        // form reset is done after server confirms - keep UI responsive
        form.reset();
        let radios = document.querySelectorAll('input[name="gender"]');
        radios.forEach(r => r.checked = false);
        document.getElementById('terms').checked = false;
      }
    });
    document.getElementById("registerForm").addEventListener("submit", function (e) {
  e.preventDefault(); // stop page refresh

  // show loader
  // document.getElementById("loader").style.display = "flex";

  // fake loading time (2 sec)
  // setTimeout(() => {
  //   window.location.href = "dashboard.html";
  // }, 2000);
});