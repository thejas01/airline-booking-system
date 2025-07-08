package com.example.payment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Long id;
    private String userEmail;
    private String flightId;
    private LocalDate bookingDate;
    private Integer numSeats;
    private Double totalAmount;
    private String status;
}