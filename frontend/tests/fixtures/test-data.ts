export const testUsers = {
  valid: {
    email: 'test@example.com',
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User'
  },
  admin: {
    email: 'admin@booking.com',
    password: 'Admin123!@#',
    firstName: 'Admin',
    lastName: 'User'
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword'
  }
};

export const testFlights = {
  sample: {
    flightNumber: 'TST001',
    airline: 'Test Airlines',
    departure: 'New York (JFK)',
    arrival: 'London (LHR)',
    departureTime: '2024-12-25T10:00:00',
    arrivalTime: '2024-12-25T22:00:00',
    price: 599.99,
    availableSeats: 100
  }
};

export const testBooking = {
  passengers: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890'
    },
    {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      phone: '+1234567891'
    }
  ],
  payment: {
    cardNumber: '4242424242424242',
    cardHolder: 'John Doe',
    expiryMonth: '12',
    expiryYear: '2025',
    cvv: '123'
  }
};