package com.thejas.flight_service.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thejas.flight_service.dto.SeatUpdateRequest;
import com.thejas.flight_service.entity.Flight;
import com.thejas.flight_service.repository.FlightRepository;
import com.thejas.flight_service.service.FlightService;

import org.springframework.http.ResponseEntity;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
public class FlightController {

    private final FlightRepository flightRepository;

    private final FlightService flightService;

    @PostMapping("/reduceSeats")
    public ResponseEntity<String> reduceSeats(@RequestBody SeatUpdateRequest request) {
        flightService.reduceSeats(request.getFlightId(), request.getNumSeats());
        return ResponseEntity.ok("Seats reduced");
    }

    @GetMapping("/search")
    public List<Flight> searchFlights(@RequestParam String source,
                                      @RequestParam String destination,
                                      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return flightRepository.findBySourceAndDestinationAndDepartureDate(source, destination, date);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addFlight(@RequestBody Flight flight) {
        flightRepository.save(flight);
        return ResponseEntity.ok("Flight added successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable Long id) {
        return flightRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Flight> allFlights() {
        return flightRepository.findAll();
    }
}
