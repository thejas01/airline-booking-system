package com.thejas.flight_service.dto;

import lombok.Data;

@Data
public class SeatUpdateRequest {
    private Long flightId;
    private int numSeats;
}


