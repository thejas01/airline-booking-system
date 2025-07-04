package com.thejas.booking_service.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.thejas.booking_service.dto.BookingRequestDto;
import com.thejas.booking_service.dto.FlightResponseDto;
import com.thejas.booking_service.dto.SeatUpdateRequest;
import com.thejas.booking_service.entity.Booking;
import com.thejas.booking_service.feign.FlightFeignClient;
import com.thejas.booking_service.repository.BookingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightFeignClient flightClient;

    
    public Booking bookFlight(String userEmail, BookingRequestDto request) {
    FlightResponseDto flight = flightClient.getFlightById(request.getFlightId());

    if (flight.getAvailableSeats() < request.getNumSeats()) {
        throw new RuntimeException("Not enough seats available.");
    }

    // 1. Proceed with booking
    Booking booking = new Booking();
    booking.setUserEmail(userEmail);
    booking.setFlightId(request.getFlightId());
    booking.setNumSeats(request.getNumSeats());
    booking.setBookingDate(LocalDate.now());
    booking.setTotalAmount(flight.getPrice() * request.getNumSeats());

    Booking saved = bookingRepository.save(booking);

    // 2. Reduce seats in Flight Service
    SeatUpdateRequest seatUpdate = new SeatUpdateRequest();
    seatUpdate.setFlightId(Long.parseLong(request.getFlightId()));
    seatUpdate.setNumSeats(request.getNumSeats());
    flightClient.reduceSeats(seatUpdate);

    return saved;
}

    public List<Booking> getBookingsByUser(String userEmail) {
        return bookingRepository.findByUserEmail(userEmail);
    }

    public Booking getBookingById(Long id, String userEmail) {
        return bookingRepository.findByIdAndUserEmail(id, userEmail);
    }

    public void cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
    
        if (!booking.getUserEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized cancellation");
        }
    
        if (booking.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Booking already cancelled");
        }
    
        // 1. Restore seats in Flight Service
        SeatUpdateRequest request = new SeatUpdateRequest();
        request.setFlightId(Long.parseLong(booking.getFlightId()));
        request.setNumSeats(-booking.getNumSeats()); // negative to increase seats
        flightClient.reduceSeats(request); // same endpoint used, works like increment here
    
        // 2. Update booking status
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }

    // Admin methods
    public Page<Booking> getAllBookingsPaginated(Pageable pageable) {
        return bookingRepository.findAll(pageable);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    public List<Booking> getBookingsByUserEmail(String userEmail) {
        return bookingRepository.findByUserEmail(userEmail);
    }

    public List<Booking> getBookingsByFlightId(Long flightId) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getFlightId().equals(flightId.toString()))
                .collect(Collectors.toList());
    }

    public Booking updateBookingStatus(Long id, String status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    public Booking cancelBookingAdmin(Long id) {
        Booking booking = getBookingById(id);
        
        if (booking.getStatus().equals("CANCELLED")) {
            return booking;
        }

        // Restore seats
        SeatUpdateRequest request = new SeatUpdateRequest();
        request.setFlightId(Long.parseLong(booking.getFlightId()));
        request.setNumSeats(-booking.getNumSeats());
        flightClient.reduceSeats(request);

        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }

    public long getTotalBookingsCount() {
        return bookingRepository.count();
    }

    public long getConfirmedBookingsCount() {
        return bookingRepository.findAll().stream()
                .filter(b -> "CONFIRMED".equals(b.getStatus()))
                .count();
    }

    public long getCancelledBookingsCount() {
        return bookingRepository.findAll().stream()
                .filter(b -> "CANCELLED".equals(b.getStatus()))
                .count();
    }

    public long getPendingBookingsCount() {
        return bookingRepository.findAll().stream()
                .filter(b -> "PENDING".equals(b.getStatus()))
                .count();
    }

    public double getTotalRevenue() {
        return bookingRepository.findAll().stream()
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .mapToDouble(Booking::getTotalAmount)
                .sum();
    }

    public Map<String, Long> getBookingCountByStatus() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .collect(Collectors.groupingBy(Booking::getStatus, Collectors.counting()));
    }

    public long getTodayBookingsCount() {
        LocalDate today = LocalDate.now();
        return bookingRepository.findAll().stream()
                .filter(b -> b.getBookingDate().equals(today))
                .count();
    }

    public double getMonthlyRevenue() {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        return bookingRepository.findAll().stream()
                .filter(b -> !b.getBookingDate().isBefore(monthStart))
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .mapToDouble(Booking::getTotalAmount)
                .sum();
    }

    public List<Booking> searchBookings(String userEmail, Long flightId, String status,
                                      LocalDate fromDate, LocalDate toDate) {
        List<Booking> bookings = bookingRepository.findAll();
        
        return bookings.stream()
                .filter(b -> userEmail == null || b.getUserEmail().contains(userEmail))
                .filter(b -> flightId == null || b.getFlightId().equals(flightId.toString()))
                .filter(b -> status == null || b.getStatus().equals(status))
                .filter(b -> fromDate == null || !b.getBookingDate().isBefore(fromDate))
                .filter(b -> toDate == null || !b.getBookingDate().isAfter(toDate))
                .collect(Collectors.toList());
    }

    public List<Booking> getRecentBookings(int limit) {
        return bookingRepository.findAll().stream()
                .sorted((b1, b2) -> b2.getBookingDate().compareTo(b1.getBookingDate()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Map<Long, Double> getRevenueByFlight() {
        List<Booking> bookings = bookingRepository.findAll();
        Map<Long, Double> revenueMap = new HashMap<>();
        
        for (Booking booking : bookings) {
            if (!"CANCELLED".equals(booking.getStatus())) {
                Long flightId = Long.parseLong(booking.getFlightId());
                revenueMap.merge(flightId, booking.getTotalAmount(), Double::sum);
            }
        }
        
        return revenueMap;
    }

    public Map<LocalDate, Double> getRevenueByDate(int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        Map<LocalDate, Double> revenueMap = new HashMap<>();
        
        bookingRepository.findAll().stream()
                .filter(b -> !b.getBookingDate().isBefore(startDate))
                .filter(b -> !"CANCELLED".equals(b.getStatus()))
                .forEach(b -> revenueMap.merge(b.getBookingDate(), b.getTotalAmount(), Double::sum));
        
        return revenueMap;
    }

    public int bulkCancelBookingsByFlight(Long flightId) {
        List<Booking> bookings = getBookingsByFlightId(flightId);
        int cancelledCount = 0;
        
        for (Booking booking : bookings) {
            if (!"CANCELLED".equals(booking.getStatus())) {
                booking.setStatus("CANCELLED");
                bookingRepository.save(booking);
                cancelledCount++;
            }
        }
        
        // Restore seats for all cancelled bookings
        if (cancelledCount > 0) {
            int totalSeats = bookings.stream()
                    .filter(b -> "CANCELLED".equals(b.getStatus()))
                    .mapToInt(Booking::getNumSeats)
                    .sum();
            
            SeatUpdateRequest request = new SeatUpdateRequest();
            request.setFlightId(flightId);
            request.setNumSeats(-totalSeats);
            flightClient.reduceSeats(request);
        }
        
        return cancelledCount;
    }
    
}
