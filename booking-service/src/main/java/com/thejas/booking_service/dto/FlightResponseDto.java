package com.thejas.booking_service.dto;

import lombok.Data;

@Data
public class FlightResponseDto {
    private String id;
    private String airline;
    private String source;
    private String destination;
    private String departureDate;
    private String departureTime;
    private Integer availableSeats;
    private Double price;
}
