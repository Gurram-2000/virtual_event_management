const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send welcome email on registration
async function sendWelcomeEmail(email, name) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Virtual Event Management Platform',
      html: `
        <h2>Welcome ${name}!</h2>
        <p>Your account has been successfully created.</p>
        <p>You can now log in and start exploring events.</p>
        <p>Thank you for joining us!</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

// Send event registration confirmation
async function sendEventRegistrationEmail(email, name, eventTitle) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Event Registration Confirmation: ${eventTitle}`,
      html: `
        <h2>Registration Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>You have successfully registered for the event: <strong>${eventTitle}</strong></p>
        <p>We look forward to seeing you there!</p>
        <p>Check your dashboard for more details.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event registration email sent to ${email}`);
  } catch (error) {
    console.error('Error sending event registration email:', error);
  }
}

// Send event update notification
async function sendEventUpdateEmail(email, name, eventTitle, updateDetails) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Event Update: ${eventTitle}`,
      html: `
        <h2>Event Update</h2>
        <p>Hi ${name},</p>
        <p>The event <strong>${eventTitle}</strong> has been updated:</p>
        <p>${updateDetails}</p>
        <p>Please check your dashboard for more details.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Event update email sent to ${email}`);
  } catch (error) {
    console.error('Error sending event update email:', error);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendEventRegistrationEmail,
  sendEventUpdateEmail,
};
