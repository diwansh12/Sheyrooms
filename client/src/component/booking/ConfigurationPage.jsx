// components/booking/ConfirmationPage.jsx - Booking Confirmation
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Download,
  Share,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ConfirmationPage = ({ booking, room, checkIn, checkOut }) => {
  useEffect(() => {
    // Send confirmation email
    // You would implement this API call
  }, [booking]);

  const downloadPDF = () => {
    // Implement PDF generation
    console.log('Downloading PDF...');
  };

  const shareBooking = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Hotel Booking',
        text: `I just booked ${room.name} from ${checkIn.format('MMM DD')} to ${checkOut.format('MMM DD')}`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="text-center">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.1
        }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
        <p className="text-lg text-gray-600">
          Your reservation has been successfully confirmed
        </p>
      </motion.div>

      {/* Booking Reference */}
      <Card className="mb-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Booking Reference</h3>
          <div className="text-3xl font-bold text-blue-600 mb-4 font-mono">
            {booking.bookingReference}
          </div>
          <p className="text-sm text-gray-600">
            Please save this reference number for your records
          </p>
        </div>
      </Card>

      {/* Booking Details */}
      <Card className="text-left mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Booking Details</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar size={18} className="mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Check-in</div>
                  <div className="text-sm text-gray-600">{checkIn.format('MMMM DD, YYYY')}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar size={18} className="mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Check-out</div>
                  <div className="text-sm text-gray-600">{checkOut.format('MMMM DD, YYYY')}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin size={18} className="mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">{room.name}</div>
                  <div className="text-sm text-gray-600">{room.type} Room</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">What's Next?</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <Mail size={16} className="mr-3 mt-1 text-gray-400" />
                <div>
                  <div className="font-medium">Confirmation Email</div>
                  <div className="text-gray-600">Sent to your email address</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <MessageCircle size={16} className="mr-3 mt-1 text-gray-400" />
                <div>
                  <div className="font-medium">SMS Update</div>
                  <div className="text-gray-600">Check-in reminders and updates</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone size={16} className="mr-3 mt-1 text-gray-400" />
                <div>
                  <div className="font-medium">24/7 Support</div>
                  <div className="text-gray-600">Call us anytime for assistance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button
          onClick={downloadPDF}
          icon={<Download size={18} />}
          variant="outline"
        >
          Download PDF
        </Button>
        
        <Button
          onClick={shareBooking}
          icon={<Share size={18} />}
          variant="outline"
        >
          Share Booking
        </Button>
        
        <Link to="/profile">
          <Button>
            View My Bookings
          </Button>
        </Link>
      </div>

      {/* Important Information */}
      <Card className="bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3">Important Information</h4>
        <div className="text-left text-sm text-blue-700 space-y-2">
          <div>• Check-in time: 3:00 PM</div>
          <div>• Check-out time: 11:00 AM</div>
          <div>• Please bring a valid photo ID</div>
          <div>• Contact hotel directly for any special requests</div>
          <div>• Free cancellation until 24 hours before check-in</div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationPage;
