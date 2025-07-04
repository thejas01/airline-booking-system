package com.thejas.booking_service.controller;

import com.thejas.booking_service.entity.Booking;
import com.thejas.booking_service.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;

    @GetMapping
    public ResponseEntity<Page<Booking>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Booking> bookings = bookingService.getAllBookingsPaginated(pageable);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/user/{userEmail}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable String userEmail) {
        List<Booking> bookings = bookingService.getBookingsByUserEmail(userEmail);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/flight/{flightId}")
    public ResponseEntity<List<Booking>> getBookingsByFlight(@PathVariable Long flightId) {
        List<Booking> bookings = bookingService.getBookingsByFlightId(flightId);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        
        Booking updatedBooking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(updatedBooking);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        Booking cancelledBooking = bookingService.cancelBookingAdmin(id);
        return ResponseEntity.ok(cancelledBooking);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getBookingStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", bookingService.getTotalBookingsCount());
        stats.put("confirmedBookings", bookingService.getConfirmedBookingsCount());
        stats.put("cancelledBookings", bookingService.getCancelledBookingsCount());
        stats.put("pendingBookings", bookingService.getPendingBookingsCount());
        stats.put("totalRevenue", bookingService.getTotalRevenue());
        stats.put("bookingsByStatus", bookingService.getBookingCountByStatus());
        stats.put("todayBookings", bookingService.getTodayBookingsCount());
        stats.put("monthlyRevenue", bookingService.getMonthlyRevenue());
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Booking>> searchBookings(
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) Long flightId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        
        List<Booking> bookings = bookingService.searchBookings(userEmail, flightId, status, fromDate, toDate);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Booking>> getRecentBookings(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Booking> recentBookings = bookingService.getRecentBookings(limit);
        return ResponseEntity.ok(recentBookings);
    }

    @GetMapping("/revenue/by-flight")
    public ResponseEntity<Map<Long, Double>> getRevenueByFlight() {
        Map<Long, Double> revenueByFlight = bookingService.getRevenueByFlight();
        return ResponseEntity.ok(revenueByFlight);
    }

    @GetMapping("/revenue/by-date")
    public ResponseEntity<Map<LocalDate, Double>> getRevenueByDate(
            @RequestParam(defaultValue = "30") int days) {
        
        Map<LocalDate, Double> revenueByDate = bookingService.getRevenueByDate(days);
        return ResponseEntity.ok(revenueByDate);
    }

    @PostMapping("/bulk-cancel")
    public ResponseEntity<Map<String, Object>> bulkCancelBookings(
            @RequestParam Long flightId) {
        
        int cancelledCount = bookingService.bulkCancelBookingsByFlight(flightId);
        Map<String, Object> response = new HashMap<>();
        response.put("cancelledBookings", cancelledCount);
        response.put("flightId", flightId);
        
        return ResponseEntity.ok(response);
    }
}