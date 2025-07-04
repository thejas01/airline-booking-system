package com.thejas.booking_service.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thejas.booking_service.dto.BookingRequestDto;
import com.thejas.booking_service.entity.Booking;
import com.thejas.booking_service.service.BookingService;
import com.thejas.booking_service.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequestDto request,
                                                  @RequestHeader("Authorization") String token) {
        String userEmail = JwtUtil.extractUsername(token);
        Booking booking = bookingService.bookFlight(userEmail, request);
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/book")
    public ResponseEntity<Booking> book(@RequestBody BookingRequestDto request,
                                        @RequestHeader("Authorization") String token) {
        String userEmail = JwtUtil.extractUsername(token);
        Booking booking = bookingService.bookFlight(userEmail, request);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/user")
    public List<Booking> getUserBookings(@RequestHeader("Authorization") String token) {
        String userEmail = JwtUtil.extractUsername(token);
        return bookingService.getBookingsByUser(userEmail);
    }

    @GetMapping("/my")
    public List<Booking> getMyBookings(@RequestHeader("Authorization") String token) {
        String userEmail = JwtUtil.extractUsername(token);
        return bookingService.getBookingsByUser(userEmail);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id,
                                                   @RequestHeader("Authorization") String token) {
        String userEmail = JwtUtil.extractUsername(token);
        Booking booking = bookingService.getBookingById(id, userEmail);
        return booking != null ? ResponseEntity.ok(booking) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/cancel/{id}")
   public ResponseEntity<String> cancelBooking(@PathVariable Long id,
                                            @RequestHeader("Authorization") String token) {
    String userEmail = JwtUtil.extractUsername(token);
    bookingService.cancelBooking(id, userEmail);
    return ResponseEntity.ok("Booking cancelled and seats restored.");
}

}
