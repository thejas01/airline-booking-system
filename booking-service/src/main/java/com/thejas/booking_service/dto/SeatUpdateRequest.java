package com.thejas.booking_service.dto;

import lombok.Data;

@Data
public class SeatUpdateRequest {
    private Long flightId;
    private int numSeats; // use negative for increase
}
