const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

/**
 * Send booking confirmation email
 */
async function sendBookingConfirmation(to, bookingData) {
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@sheyrooms.com',
    to: to,
    subject: 'SheyRooms - Booking Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Booking Confirmed!</h1>
        <p>Dear ${bookingData.guest?.firstName || 'Valued Customer'},</p>
        <p>Thank you for choosing SheyRooms. Your booking has been confirmed!</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Room:</strong> ${bookingData.room?.name || 'N/A'}</li>
            <li><strong>Booking ID:</strong> ${bookingData.booking?.bookingReference || bookingData.booking?._id}</li>
            <li><strong>Check-in:</strong> ${new Date(bookingData.booking?.fromdate).toLocaleDateString()}</li>
            <li><strong>Check-out:</strong> ${new Date(bookingData.booking?.todate).toLocaleDateString()}</li>
            <li><strong>Total Amount:</strong> ₹${bookingData.booking?.totalamount?.toLocaleString() || '0'}</li>
          </ul>
        </div>
        
        <p>We look forward to hosting you!</p>
        <p>Best regards,<br/>The SheyRooms Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Booking confirmation email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending booking confirmation:', error.message);
  }
}

/**
 * Send cancellation email
 */
async function sendCancellationEmail(to, cancellationData) {
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@sheyrooms.com',
    to: to,
    subject: 'SheyRooms - Booking Cancellation Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Booking Cancelled</h1>
        <p>Dear Valued Customer,</p>
        <p>Your booking has been successfully cancelled as requested.</p>
        
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <h3>Cancellation Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Refund Amount:</strong> ₹${cancellationData.refundAmount?.toLocaleString() || '0'}</li>
            <li><strong>Refund Percentage:</strong> ${cancellationData.refundPercentage || 0}%</li>
            <li><strong>Processing Time:</strong> 3-5 business days</li>
          </ul>
        </div>
        
        <p>The refund will be processed to your original payment method within 3-5 business days.</p>
        <p>Thank you for choosing SheyRooms. We hope to serve you again in the future.</p>
        <p>Best regards,<br/>The SheyRooms Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Cancellation email sent to:', to);
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error.message);
  }
}

module.exports = {
  sendBookingConfirmation,
  sendCancellationEmail
};
