package com.thejas.booking_service.dto;

import lombok.Data;

@Data
public class BookingRequestDto {
    private String flightId;
    private Integer numSeats;
}
