
  const form = document.getElementById("contactForm");
  const successAlert = document.getElementById("contactAlert");
  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");

  // create error alert
  const errorAlert = document.createElement("div");
  errorAlert.innerHTML = "<strong>Error!</strong> Please fill in all fields.";
  errorAlert.className =
    "fixed top-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg";
  errorAlert.style.display = "none";
  document.body.appendChild(errorAlert);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = form.querySelector('input[type="text"]');
    const email = form.querySelector('input[type="email"]');
    const message = form.querySelector("textarea");

    // hide alerts
    successAlert.style.display = "none";
    errorAlert.style.display = "none";

    // VALIDATION
    if (
      name.value.trim() === "" ||
      email.value.trim() === "" ||
      message.value.trim() === ""
    ) {
      errorAlert.style.display = "block";
      setTimeout(() => {
        errorAlert.style.display = "none";
      }, 3000);
      return;
    }

    // LOADING
    submitBtn.disabled = true;
    btnText.textContent = "Sending...";

    // SUCCESS (simulate loading)
    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = "Send Message";

      successAlert.style.display = "block";
      form.reset();

      setTimeout(() => {
        successAlert.style.display = "none";
      }, 3000);
    }, 1500);
  });

