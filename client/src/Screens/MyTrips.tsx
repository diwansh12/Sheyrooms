// src/Screens/MyTrips.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button.tsx";
import { Input } from "../Components/ui/input.tsx";
import { Card, CardContent } from "../Components/ui/card.tsx";
import { Badge } from "../Components/ui/badge.tsx";
import { Search, Calendar } from "lucide-react";
import { ImageWithFallback } from "../Components/figma/ImageWithFallback.tsx";
import { useUserBookings } from "../hooks/useBookings.ts";

interface Trip {
  id: string;
  name: string;
  location: string;
  dates: string;
  nights: number;
  guests: number;
  adults?: number;
  children?: number;
  roomType: string;
  roomCode: string;
  price: number;
  status: "confirmed" | "pending" | "checkedIn" | "completed" | "cancelled";
  image: string;
  category: "upcoming" | "current" | "past";
  canCancel?: boolean;
  checkInDate: string;
  checkOutDate: string;
}

export default function MyTrips() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "current" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const { bookings, loading, error, cancelBooking } = useUserBookings();

  // Map backend bookings to UI Trip model
  const trips: Trip[] = bookings.map((booking: any) => {
    const now = new Date();
    const checkIn = new Date(booking.fromdate);
    const checkOut = new Date(booking.todate);

    let category: Trip["category"];
    if (checkOut < now) category = "past";
    else if (checkIn <= now && checkOut >= now) category = "current";
    else category = "upcoming";

    let status: Trip["status"];
    switch (booking.status) {
      case "confirmed":
        status = category === "current" ? "checkedIn" : "confirmed";
        break;
      case "cancelled":
        status = "cancelled";
        break;
      case "checked-out":
        status = "completed";
        break;
      default:
        status = "pending";
    }

    const nights =
      booking.pricing?.totalNights ||
      Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const dates = `${checkIn.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    })} - ${checkOut.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}`;

    const adults = booking.guests?.adults || 0;
    const children = booking.guests?.children || 0;

    const price =
      booking.pricing?.totalamount ??
      booking.pricing?.totalAmount ??
      booking.totalamount ??
      0;

    // Defensive guard for image
    const safeImage =
      typeof booking.roomPrimaryImage === "string" &&
      booking.roomPrimaryImage.startsWith("http")
        ? booking.roomPrimaryImage
        : "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop";

    return {
      id: booking._id,
      name: booking.roomName || "Hotel Room",
      location: booking.roomId?.location?.wing
        ? `${booking.roomId.location.wing} Wing`
        : booking.roomId?.address || "Location",
      dates,
      nights,
      guests: adults + children,
      adults,
      children,
      roomType: booking.roomId?.type || "Standard",
      roomCode: booking.bookingReference || booking._id.slice(-6).toUpperCase(),
      price,
      status,
      image: safeImage,
      category,
      canCancel: booking.canCancel,
      checkInDate: booking.checkInDate || checkIn.toLocaleDateString("en-GB"),
      checkOutDate: booking.checkOutDate || checkOut.toLocaleDateString("en-GB"),
    };
  });

  // Filters: tab + search
  const filteredTrips = trips.filter((trip) => {
    const matchesTab = trip.category === activeTab;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q.length === 0 ||
      trip.name.toLowerCase().includes(q) ||
      trip.location.toLowerCase().includes(q) ||
      trip.roomCode.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const upcomingCount = trips.filter((t) => t.category === "upcoming").length;
  const currentCount = trips.filter((t) => t.category === "current").length;
  const pastCount = trips.filter((t) => t.category === "past").length;

  const handleCancelTrip = async (tripId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const result = await cancelBooking(tripId, "User requested cancellation");
      alert(result.success ? "Booking cancelled successfully" : `Failed to cancel: ${result.message}`);
    }
  };

  const handleViewDetails = (trip: Trip) => {
    navigate(`/booking/${trip.id}`);
  };

  const getStatusBadge = (status: Trip["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-50 text-green-700 border border-green-200 hover:bg-green-50">
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-50">
            Pending payment
          </Badge>
        );
      case "checkedIn":
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50">
            Checked in
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-50">
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-50">
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load trips: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  {filteredTrips.map((trip) => {
  // ✅ Add this debug log inside the map function
  console.log(`🎯 Rendering trip ${trip.id}:`, {
    status: trip.status,
    canCancel: trip.canCancel,
    statusMatch: trip.status === "confirmed",
    canCancelTruthy: !!trip.canCancel,
    shouldShowCancelButton: trip.status === "confirmed" && trip.canCancel
  });

  return (
    <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Your existing card content */}
    </Card>
  );
})}

  return (
    <div className="p-6">
      {/* Header with Back to Home */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Trips</h1>
          <p className="text-gray-600">All your bookings — upcoming, current, and past</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate("/home")}
        >
          Back to Home
        </Button>
      </div>

      {/* Search and Tabs */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {upcomingCount}
            </span>
            <span className="text-gray-500 text-sm">upcoming</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {currentCount}
            </span>
            <span className="text-gray-500 text-sm">current</span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {pastCount}
            </span>
            <span className="text-gray-500 text-sm">past</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search destination, hotel, or booking code"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === "upcoming"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("current")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === "current"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                activeTab === "past"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Past
            </button>
          </div>
        </div>
      </div>

      {/* Section Header */}
      {activeTab === "upcoming" && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-2">
          Upcoming trips
        </h2>
      )}
      {activeTab === "current" && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-2">
          Current stay
        </h2>
      )}
      {activeTab === "past" && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-2">
          Past trips
        </h2>
      )}

      {/* Trip Cards */}
      <div className="space-y-4">
        {filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <Card key={trip.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Trip Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    <ImageWithFallback
                      src={trip.image}
                      alt={trip.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {trip.name}
                        </h3>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {trip.dates} • {trip.nights} nights
                            </span>
                          </div>
                          <span>
                            {trip.adults} adults
                            {trip.children ? ` • ${trip.children} children` : ""}
                          </span>
                          {getStatusBadge(trip.status)}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{trip.location}</span>
                          <span>{trip.roomCode}</span>
                          <span className="font-semibold text-gray-900">
                            ₹{trip.price.toLocaleString()} total
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="ml-4">
                        {/* Confirmed */}
                        {trip.status === "confirmed" && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600"
                              onClick={() => handleViewDetails(trip)}
                            >
                              View details
                            </Button>
                            {trip.canCancel && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-gray-600"
                                onClick={() => handleCancelTrip(trip.id)}
                              >
                                Cancel trip
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Pending */}
                        {trip.status === "pending" && (
                          <div className="flex space-x-2">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                              Complete payment
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelTrip(trip.id)}
                            >
                              Cancel trip
                            </Button>
                          </div>
                        )}

                        {/* Checked In */}
                        {trip.status === "checkedIn" && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600"
                              onClick={() => handleViewDetails(trip)}
                            >
                              View receipt
                            </Button>
                            <Button variant="outline" size="sm" className="text-gray-600">
                              Contact host
                            </Button>
                          </div>
                        )}

                        {/* Completed */}
                        {trip.status === "completed" && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600"
                              onClick={() => handleViewDetails(trip)}
                            >
                              View details
                            </Button>
                            <Button variant="outline" size="sm" className="text-gray-600">
                              Leave review
                            </Button>
                          </div>
                        )}

                        {/* Cancelled */}
                        {trip.status === "cancelled" && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600"
                              onClick={() => handleViewDetails(trip)}
                            >
                              View details
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `No trips found matching "${searchQuery}"`
                : `No ${activeTab} trips found`}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Archive Notice */}
      {activeTab === "past" && (
        <div className="text-center mt-8 text-gray-500 text-sm">
          Older trips are archived after 24 months
        </div>
      )}

      {/* Route */}
      <div className="text-center mt-8 text-gray-400 text-sm">Route: /trips</div>
    </div>
  );
}
