const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate booking confirmation PDF
 */
async function generateBookingPDF(bookingData) {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument();
      
      // Generate filename
      const filename = `booking-${bookingData.bookingId || Date.now()}.pdf`;
      const filepath = path.join(__dirname, '../pdfs', filename);
      
      // Ensure pdfs directory exists
      const pdfDir = path.dirname(filepath);
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      
      // Pipe PDF to file
      doc.pipe(fs.createWriteStream(filepath));
      
      // Add hotel logo/header
      doc.fontSize(24)
         .fillColor('#3B82F6')
         .text('SheyRooms', { align: 'center' })
         .moveDown();
      
      // Add title
      doc.fontSize(18)
         .fillColor('#000')
         .text('Booking Confirmation', { align: 'center' })
         .moveDown();
      
      // Add booking details
      doc.fontSize(12)
         .text(`Booking Reference: ${bookingData.bookingReference || bookingData.bookingId}`, { align: 'left' })
         .moveDown(0.5);
      
      doc.text(`Guest Name: ${bookingData.guestName || 'N/A'}`)
         .moveDown(0.5);
      
      doc.text(`Room: ${bookingData.roomName || 'N/A'}`)
         .moveDown(0.5);
      
      doc.text(`Check-in: ${new Date(bookingData.checkIn).toLocaleDateString()}`)
         .moveDown(0.5);
      
      doc.text(`Check-out: ${new Date(bookingData.checkOut).toLocaleDateString()}`)
         .moveDown(0.5);
      
      doc.text(`Total Amount: ₹${bookingData.totalAmount?.toLocaleString() || '0'}`)
         .moveDown();
      
      // Add terms and conditions
      doc.fontSize(10)
         .fillColor('#666')
         .text('Terms & Conditions:', { underline: true })
         .moveDown(0.3)
         .text('• Check-in time: 3:00 PM')
         .text('• Check-out time: 11:00 AM')
         .text('• Please bring valid photo ID')
         .text('• Cancellation allowed up to 24 hours before check-in')
         .moveDown();
      
      // Add footer
      doc.fontSize(8)
         .fillColor('#999')
         .text('Thank you for choosing SheyRooms!', { align: 'center' })
         .text('For support, contact us at support@sheyrooms.com', { align: 'center' });
      
      // Finalize PDF file
      doc.end();
      
      doc.on('end', () => {
        resolve({
          success: true,
          filename,
          filepath,
          message: 'PDF generated successfully'
        });
      });
      
      doc.on('error', (error) => {
        reject({
          success: false,
          error: error.message
        });
      });
      
    } catch (error) {
      reject({
        success: false,
        error: error.message
      });
    }
  });
}

/**
 * Generate simple PDF with custom content
 */
async function generateSimplePDF(content, filename = 'document.pdf') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filepath = path.join(__dirname, '../pdfs', filename);
      
      // Ensure directory exists
      const pdfDir = path.dirname(filepath);
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }
      
      doc.pipe(fs.createWriteStream(filepath));
      
      doc.fontSize(12)
         .text(content, 100, 100);
      
      doc.end();
      
      doc.on('end', () => {
        resolve({ success: true, filepath });
      });
      
      doc.on('error', (error) => {
        reject({ success: false, error: error.message });
      });
      
    } catch (error) {
      reject({ success: false, error: error.message });
    }
  });
}

module.exports = {
  generateBookingPDF,
  generateSimplePDF
};
