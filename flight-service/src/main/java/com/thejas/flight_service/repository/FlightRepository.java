package com.thejas.flight_service.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.thejas.flight_service.entity.Flight;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    List<Flight> findBySourceAndDestinationAndDepartureDate(
        String source,
        String destination,
        LocalDate departureDate
    );
}
