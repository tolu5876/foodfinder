// contact.js - simple validation and success alert behavior (based on registration main.js)
document.addEventListener('DOMContentLoaded', function () {
  const alertEl = document.getElementById('contactAlert');
  if (alertEl) {
    alertEl.setAttribute('role','status');
    alertEl.setAttribute('aria-live','polite');
    alertEl.style.setProperty('display', 'none', 'important');
  }

  const sendBtn = document.getElementById('contactSend');
  if (!sendBtn) return;

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  sendBtn.addEventListener('click', function (e) {
    e.preventDefault();

    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
    const message = document.getElementById('message');

    let valid = true;

    if (!name || name.value.trim() === '') valid = false;
    if (!email || !validateEmail(email.value.trim())) valid = false;
    if (!subject || subject.value.trim() === '') valid = false;
    if (!message || message.value.trim() === '') valid = false;

    if (!valid) {
      if (alertEl) {
        alertEl.classList.remove('alert-success');
        alertEl.classList.add('alert-danger');
        alertEl.innerHTML = `
          <div class="alert-icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#fff" opacity=".01"/><path d="M12 8v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="alert-body">
            <div class="alert-title">There was a problem</div>
            <div class="alert-message">Please fill in all required fields and provide a valid email address.</div>
          </div>
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertEl.style.setProperty('display', 'flex', 'important');
        setTimeout(() => {
          alertEl.style.setProperty('display', 'none', 'important');
        }, 4500);
      } else {
        alert('Please fill in all required fields and provide a valid email.');
      }
      return;
    }

    // success
    if (alertEl) {
      alertEl.classList.remove('alert-danger');
      alertEl.classList.add('alert-success');
      alertEl.innerHTML = `
        <div class="alert-icon" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>
        </div>
        <div class="alert-body">
          <div class="alert-title">Message sent</div>
          <div class="alert-message">Thank you — we've received your message and will respond within 1–2 business days.</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      alertEl.style.setProperty('display', 'flex', 'important');
      setTimeout(() => {
        alertEl.style.setProperty('display', 'none', 'important');
      }, 3300);
    }

    // clear fields
    if (name) name.value = '';
    if (email) email.value = '';
    if (subject) subject.value = '';
    if (message) message.value = '';
  });
});
