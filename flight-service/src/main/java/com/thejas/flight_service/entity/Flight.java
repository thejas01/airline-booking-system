package com.thejas.flight_service.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String flightNumber;
    private String airline;

    private String source;
    private String destination;

    private LocalDate departureDate;
    private String departureTime;
    
    @Column(name = "departure_date_time")
    private LocalDateTime departureDateTime;

    private int availableSeats;
    
    @Column(name = "total_seats", nullable = false, columnDefinition = "INTEGER DEFAULT 0")
    private int totalSeats = 0;

    private double price;
    
    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'ACTIVE'")
    private String status = "ACTIVE";
    
    // Helper methods for backward compatibility
    public String getOrigin() {
        return source;
    }
    
    public void setOrigin(String origin) {
        this.source = origin;
    }
    
    public LocalDateTime getDepartureTime() {
        if (departureDateTime != null) {
            return departureDateTime;
        }
        // Fallback: combine departureDate and departureTime string
        if (departureDate != null && departureTime != null) {
            String[] timeParts = departureTime.split(":");
            if (timeParts.length >= 2) {
                int hour = Integer.parseInt(timeParts[0]);
                int minute = Integer.parseInt(timeParts[1]);
                return departureDate.atTime(hour, minute);
            }
        }
        return LocalDateTime.now();
    }
}
