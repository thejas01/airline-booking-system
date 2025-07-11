// Booking request - matches backend BookingRequestDto exactly
export interface BookingRequest {
  flightId: string; // Backend expects string
  numSeats: number; // Backend uses numSeats, not numberOfSeats
}

// Booking entity - matches backend Booking model exactly
export interface Booking {
  id: number;
  userEmail: string; // Backend uses userEmail from JWT
  flightId: string; // Backend uses string flightId
  bookingDate: string; // LocalDate as ISO string (YYYY-MM-DD)
  numSeats: number; // Backend uses numSeats
  totalAmount: number;
  status: string; // CONFIRMED, CANCELLED
}

// Extended booking with flight details for UI display
export interface BookingWithFlight extends Booking {
  flight?: {
    airline: string;
    source: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    price: number;
  };
}

// Booking creation response (backend returns Booking directly)
export interface BookingResponse extends Booking {}

// For frontend forms (before converting to backend format)
export interface BookingFormData {
  flightId: number; // Frontend uses number initially
  numberOfSeats: number; // Frontend form field name
}