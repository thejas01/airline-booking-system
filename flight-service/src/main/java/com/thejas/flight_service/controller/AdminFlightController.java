package com.thejas.flight_service.controller;

import com.thejas.flight_service.entity.Flight;
import com.thejas.flight_service.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/flights")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminFlightController {

    private final FlightService flightService;

    @GetMapping
    public ResponseEntity<Page<Flight>> getAllFlights(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Flight> flights = flightService.getAllFlightsPaginated(pageable);
        return ResponseEntity.ok(flights);
    }

    @PostMapping
    public ResponseEntity<Flight> createFlight(@RequestBody Flight flight) {
        Flight createdFlight = flightService.createFlight(flight);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFlight);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Flight> updateFlight(
            @PathVariable Long id,
            @RequestBody Flight flight) {
        
        flight.setId(id);
        Flight updatedFlight = flightService.updateFlight(flight);
        return ResponseEntity.ok(updatedFlight);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlight(@PathVariable Long id) {
        flightService.deleteFlight(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Flight> cancelFlight(@PathVariable Long id) {
        Flight cancelledFlight = flightService.cancelFlight(id);
        return ResponseEntity.ok(cancelledFlight);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getFlightStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFlights", flightService.getTotalFlightsCount());
        stats.put("activeFlights", flightService.getActiveFlightsCount());
        stats.put("cancelledFlights", flightService.getCancelledFlightsCount());
        stats.put("flightsByAirline", flightService.getFlightCountByAirline());
        stats.put("availableSeats", flightService.getTotalAvailableSeats());
        stats.put("bookingRate", flightService.getAverageBookingRate());
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/search/advanced")
    public ResponseEntity<List<Flight>> advancedSearch(
            @RequestParam(required = false) String flightNumber,
            @RequestParam(required = false) String airline,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departureFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime departureTo,
            @RequestParam(required = false) String status) {
        
        List<Flight> flights = flightService.advancedSearch(
            flightNumber, airline, origin, destination, departureFrom, departureTo, status
        );
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Flight>> getUpcomingFlights(
            @RequestParam(defaultValue = "24") int hours) {
        
        List<Flight> upcomingFlights = flightService.getUpcomingFlights(hours);
        return ResponseEntity.ok(upcomingFlights);
    }

    @GetMapping("/low-occupancy")
    public ResponseEntity<List<Flight>> getLowOccupancyFlights(
            @RequestParam(defaultValue = "30") int thresholdPercentage) {
        
        List<Flight> lowOccupancyFlights = flightService.getLowOccupancyFlights(thresholdPercentage);
        return ResponseEntity.ok(lowOccupancyFlights);
    }

    @PostMapping("/bulk-update-prices")
    public ResponseEntity<Map<String, Object>> bulkUpdatePrices(
            @RequestParam String airline,
            @RequestParam double percentageChange) {
        
        int updatedCount = flightService.bulkUpdatePrices(airline, percentageChange);
        Map<String, Object> response = new HashMap<>();
        response.put("updatedFlights", updatedCount);
        response.put("airline", airline);
        response.put("percentageChange", percentageChange);
        
        return ResponseEntity.ok(response);
    }
}