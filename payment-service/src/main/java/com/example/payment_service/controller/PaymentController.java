package com.example.payment_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.payment_service.dto.PaymentRequestDto;
import com.example.payment_service.dto.PaymentResponseDto;
import com.example.payment_service.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping
    public ResponseEntity<PaymentResponseDto> processPayment(
            @Valid @RequestBody PaymentRequestDto paymentRequest,
            @RequestHeader("X-User-Id") String userId) {
        log.info("Processing payment request for booking: {}", paymentRequest.getBookingId());
        PaymentResponseDto response = paymentService.processPayment(paymentRequest, userId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDto> getPaymentById(@PathVariable Long id) {
        log.info("Fetching payment with id: {}", id);
        PaymentResponseDto response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponseDto> getPaymentByBookingId(@PathVariable Long bookingId) {
        log.info("Fetching payment for booking: {}", bookingId);
        PaymentResponseDto response = paymentService.getPaymentByBookingId(bookingId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByUserId(@PathVariable String userId) {
        log.info("Fetching payments for user: {}", userId);
        List<PaymentResponseDto> payments = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(payments);
    }
    
    @PostMapping("/{id}/refund")
    public ResponseEntity<PaymentResponseDto> initiateRefund(
            @PathVariable Long id,
            @RequestParam Double refundAmount) {
        log.info("Initiating refund for payment: {} with amount: {}", id, refundAmount);
        PaymentResponseDto response = paymentService.initiateRefund(id, refundAmount);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Payment Service is running");
    }
}