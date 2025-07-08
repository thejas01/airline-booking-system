package com.example.payment_service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;
    
    @NotNull(message = "Payment method is required")
    private String paymentMethod;
    
    private String currency = "INR";
    
    private String cardNumber;
    private String cvv;
    private String expiryMonth;
    private String expiryYear;
    
    private String upiId;
    
    private String walletProvider;
}