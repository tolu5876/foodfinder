# EmailJS Setup Guide for Contact Form

This guide will help you set up EmailJS so that contact form messages are sent directly to your Gmail inbox.

## Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **"Sign Up"** (it's free for up to 200 emails/month)
3. Create an account using your Gmail address (foodfindr27@gmail.com)

## Step 2: Add Email Service

1. After logging in, go to **"Email Services"** in the dashboard
2. Click **"Add New Service"**
3. Select **"Gmail"** as your email service
4. Click **"Connect Account"** and authorize EmailJS to access your Gmail
5. Give it a name (e.g., "FoodieFindr Gmail")
6. Click **"Create Service"**
7. **Copy the Service ID** (you'll need this later)

## Step 3: Create Email Template

1. Go to **"Email Templates"** in the dashboard
2. Click **"Create New Template"**
3. Use this template:

**Template Name:** Contact Form Message

**Subject:** New Contact Form Message from FoodieFindr

**Content:**
```
New message from FoodieFindr contact form:

From: {{from_name}}
Email: {{from_email}}

Message:
{{message}}

---
This message was sent from the FoodieFindr website contact form.
```

4. Set **"To Email"** to: `foodfindr27@gmail.com`
5. Set **"From Name"** to: `FoodieFindr Contact Form`
6. Click **"Save"**
7. **Copy the Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Go to **"Account"** → **"General"** in the dashboard
2. Find your **"Public Key"** (also called API Key)
3. **Copy the Public Key**

## Step 5: Update the Contact Us Page

1. Open `src/Contact Us.html`
2. Find this line (around line 165):
   ```javascript
   emailjs.init("YOUR_PUBLIC_KEY");
   ```
3. Replace `YOUR_PUBLIC_KEY` with your actual Public Key from Step 4

4. Find this line (around line 220):
   ```javascript
   .send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", templateParams)
   ```
5. Replace `YOUR_SERVICE_ID` with your Service ID from Step 2
6. Replace `YOUR_TEMPLATE_ID` with your Template ID from Step 3

## Example (After Setup):

```javascript
emailjs.init("abc123xyz789"); // Your Public Key

// ...

.send("service_gmail", "template_contact", templateParams)
```

## Step 6: Test the Form

1. Open your Contact Us page in a browser
2. Fill out the form with test data
3. Submit the form
4. Check your Gmail inbox (foodfindr27@gmail.com) for the message

## Troubleshooting

- **"Failed to send message"**: Check that all IDs are correct and your EmailJS account is active
- **No email received**: Check your spam folder
- **Service not found**: Make sure you've created and saved the email service
- **Template not found**: Verify the template ID is correct

## Free Plan Limits

- 200 emails per month (free tier)
- If you need more, consider upgrading to a paid plan

## Security Note

The Public Key is safe to use in frontend code. It's designed to be public and only allows sending emails through your configured templates.

---

**Need Help?** Visit [EmailJS Documentation](https://www.emailjs.com/docs/)
