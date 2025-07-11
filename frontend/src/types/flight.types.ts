// Flight entity - matches backend Flight model exactly
export interface Flight {
  id: number;
  airline: string;
  source: string;
  destination: string;
  departureDate: string; // LocalDate as ISO string (YYYY-MM-DD)
  departureTime: string;
  availableSeats: number;
  price: number;
}

// Flight search parameters - matches backend search endpoint
export interface FlightSearchParams {
  source: string;
  destination: string;
  date: string; // LocalDate as ISO string (YYYY-MM-DD)
}

// Add flight request - matches backend Flight creation
export interface AddFlightRequest {
  airline: string;
  source: string;
  destination: string;
  departureDate: string; // LocalDate as ISO string (YYYY-MM-DD)
  departureTime: string;
  availableSeats: number;
  price: number;
}

// Flight response from booking service - matches FlightResponseDto
export interface FlightResponse {
  id: string; // Note: booking service expects string ID
  airline: string;
  source: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  price: number;
}

// Seat update request - matches backend SeatUpdateRequest
export interface SeatUpdateRequest {
  flightId: number;
  numSeats: number;
}