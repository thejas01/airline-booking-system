package com.thejas.flight_service.service;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.thejas.flight_service.entity.Flight;
import com.thejas.flight_service.repository.FlightRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;

    public void reduceSeats(Long flightId, int numSeats) {
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
    
        int newSeats = flight.getAvailableSeats() - numSeats;
    
        if (newSeats < 0) {
            throw new RuntimeException("Seat count underflow");
        }
    
        flight.setAvailableSeats(newSeats);
        flightRepository.save(flight);
    }

    // Admin methods
    public Page<Flight> getAllFlightsPaginated(Pageable pageable) {
        return flightRepository.findAll(pageable);
    }

    public Flight createFlight(Flight flight) {
        // Initialize totalSeats if not set
        if (flight.getTotalSeats() == 0 && flight.getAvailableSeats() > 0) {
            flight.setTotalSeats(flight.getAvailableSeats());
        }
        return flightRepository.save(flight);
    }

    public Flight updateFlight(Flight flight) {
        if (!flightRepository.existsById(flight.getId())) {
            throw new RuntimeException("Flight not found");
        }
        return flightRepository.save(flight);
    }

    public void deleteFlight(Long id) {
        if (!flightRepository.existsById(id)) {
            throw new RuntimeException("Flight not found");
        }
        flightRepository.deleteById(id);
    }

    public Flight cancelFlight(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
        flight.setStatus("CANCELLED");
        return flightRepository.save(flight);
    }

    public long getTotalFlightsCount() {
        return flightRepository.count();
    }

    public long getActiveFlightsCount() {
        return flightRepository.findAll().stream()
                .filter(f -> !"CANCELLED".equals(f.getStatus()))
                .count();
    }

    public long getCancelledFlightsCount() {
        return flightRepository.findAll().stream()
                .filter(f -> "CANCELLED".equals(f.getStatus()))
                .count();
    }

    public Map<String, Long> getFlightCountByAirline() {
        List<Flight> flights = flightRepository.findAll();
        return flights.stream()
                .collect(Collectors.groupingBy(Flight::getAirline, Collectors.counting()));
    }

    public long getTotalAvailableSeats() {
        return flightRepository.findAll().stream()
                .mapToInt(Flight::getAvailableSeats)
                .sum();
    }

    public double getAverageBookingRate() {
        List<Flight> flights = flightRepository.findAll();
        if (flights.isEmpty()) return 0.0;
        
        double totalBookingRate = flights.stream()
                .mapToDouble(f -> {
                    int totalSeats = f.getTotalSeats();
                    // If totalSeats is 0, use availableSeats as totalSeats
                    if (totalSeats == 0) {
                        totalSeats = f.getAvailableSeats();
                    }
                    int bookedSeats = totalSeats - f.getAvailableSeats();
                    return totalSeats > 0 ? (double) bookedSeats / totalSeats * 100 : 0;
                })
                .sum();
        
        return totalBookingRate / flights.size();
    }

    public List<Flight> advancedSearch(String flightNumber, String airline, String origin,
                                     String destination, LocalDateTime departureFrom, 
                                     LocalDateTime departureTo, String status) {
        List<Flight> flights = flightRepository.findAll();
        
        return flights.stream()
                .filter(f -> flightNumber == null || f.getFlightNumber().contains(flightNumber))
                .filter(f -> airline == null || f.getAirline().contains(airline))
                .filter(f -> origin == null || f.getOrigin().contains(origin))
                .filter(f -> destination == null || f.getDestination().contains(destination))
                .filter(f -> departureFrom == null || f.getDepartureTime().isAfter(departureFrom))
                .filter(f -> departureTo == null || f.getDepartureTime().isBefore(departureTo))
                .filter(f -> status == null || f.getStatus().equals(status))
                .collect(Collectors.toList());
    }

    public List<Flight> getUpcomingFlights(int hours) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime deadline = now.plusHours(hours);
        
        return flightRepository.findAll().stream()
                .filter(f -> f.getDepartureTime().isAfter(now) && f.getDepartureTime().isBefore(deadline))
                .filter(f -> !"CANCELLED".equals(f.getStatus()))
                .sorted((f1, f2) -> f1.getDepartureTime().compareTo(f2.getDepartureTime()))
                .collect(Collectors.toList());
    }

    public List<Flight> getLowOccupancyFlights(int thresholdPercentage) {
        return flightRepository.findAll().stream()
                .filter(f -> {
                    int totalSeats = f.getTotalSeats();
                    // If totalSeats is 0, use availableSeats as totalSeats
                    if (totalSeats == 0) {
                        totalSeats = f.getAvailableSeats();
                    }
                    int bookedSeats = totalSeats - f.getAvailableSeats();
                    double occupancyRate = totalSeats > 0 ? (double) bookedSeats / totalSeats * 100 : 0;
                    return occupancyRate < thresholdPercentage;
                })
                .filter(f -> !"CANCELLED".equals(f.getStatus()))
                .filter(f -> f.getDepartureTime().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());
    }

    public int bulkUpdatePrices(String airline, double percentageChange) {
        List<Flight> flights = flightRepository.findAll().stream()
                .filter(f -> f.getAirline().equals(airline))
                .filter(f -> !"CANCELLED".equals(f.getStatus()))
                .collect(Collectors.toList());
        
        for (Flight flight : flights) {
            double currentPrice = flight.getPrice();
            double newPrice = currentPrice * (1 + percentageChange / 100);
            flight.setPrice(newPrice);
            flightRepository.save(flight);
        }
        
        return flights.size();
    }
    
}
