// src/Screens/BookingDetails.tsx
import { useParams } from 'react-router-dom';

export default function BookingDetails() {
  const { bookingId } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">Booking Details</h1>
      <p className="text-gray-600">Booking ID: {bookingId}</p>
      {/* TODO: Add a real fetch by ID endpoint and render full details */}
    </div>
  );
}
