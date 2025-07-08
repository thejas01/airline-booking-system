package com.example.payment_service.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.payment_service.dto.BookingDto;
import com.example.payment_service.dto.PaymentRequestDto;
import com.example.payment_service.dto.PaymentResponseDto;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.enums.PaymentMethod;
import com.example.payment_service.enums.PaymentStatus;
import com.example.payment_service.exception.PaymentException;
import com.example.payment_service.exception.PaymentNotFoundException;
import com.example.payment_service.feign.BookingClient;
import com.example.payment_service.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final BookingClient bookingClient;
    private final PaymentRepository paymentRepository;

    public PaymentResponseDto processPayment(PaymentRequestDto paymentRequest, String userId) {
        log.info("Processing payment for booking: {}", paymentRequest.getBookingId());
        
        BookingDto booking = bookingClient.getBookingById(paymentRequest.getBookingId());
        
        if (!booking.getTotalAmount().equals(paymentRequest.getAmount())) {
            throw new PaymentException("Payment amount mismatch. Expected: " + booking.getTotalAmount() + ", Received: " + paymentRequest.getAmount());
        }
        
        if (paymentRepository.findByBookingId(paymentRequest.getBookingId()).isPresent()) {
            throw new PaymentException("Payment already exists for booking: " + paymentRequest.getBookingId());
        }
        
        Payment payment = Payment.builder()
                .bookingId(paymentRequest.getBookingId())
                .userId(userId)
                .amount(paymentRequest.getAmount())
                .currency(paymentRequest.getCurrency())
                .paymentMethod(PaymentMethod.valueOf(paymentRequest.getPaymentMethod()))
                .status(PaymentStatus.PROCESSING)
                .build();
        
        payment = paymentRepository.save(payment);
        
        try {
            String transactionId = processWithPaymentGateway(paymentRequest);
            
            payment.setTransactionId(transactionId);
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaymentTime(LocalDateTime.now());
            
            bookingClient.updateBookingStatus(booking.getId(), "PAID");
            
        } catch (Exception e) {
            log.error("Payment processing failed: ", e);
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(e.getMessage());
            throw new PaymentException("Payment processing failed: " + e.getMessage());
        } finally {
            payment = paymentRepository.save(payment);
        }
        
        return convertToResponseDto(payment);
    }
    
    public PaymentResponseDto getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));
        return convertToResponseDto(payment);
    }
    
    public PaymentResponseDto getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for booking: " + bookingId));
        return convertToResponseDto(payment);
    }
    
    public List<PaymentResponseDto> getPaymentsByUserId(String userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);
        return payments.stream()
                .map(this::convertToResponseDto)
                .toList();
    }
    
    @Transactional
    public PaymentResponseDto initiateRefund(Long paymentId, Double refundAmount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException(paymentId));
        
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new PaymentException("Cannot refund payment with status: " + payment.getStatus());
        }
        
        if (refundAmount > payment.getAmount()) {
            throw new PaymentException("Refund amount cannot exceed payment amount");
        }
        
        payment.setRefundAmount(refundAmount);
        payment.setStatus(refundAmount.equals(payment.getAmount()) ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED);
        
        payment = paymentRepository.save(payment);
        
        return convertToResponseDto(payment);
    }
    
    private String processWithPaymentGateway(PaymentRequestDto paymentRequest) {
        log.info("Processing payment with gateway for amount: {}", paymentRequest.getAmount());
        return "TXN_" + UUID.randomUUID().toString();
    }
    
    private PaymentResponseDto convertToResponseDto(Payment payment) {
        return PaymentResponseDto.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().toString())
                .paymentMethod(payment.getPaymentMethod().toString())
                .transactionId(payment.getTransactionId())
                .paymentTime(payment.getPaymentTime())
                .message(getPaymentStatusMessage(payment))
                .build();
    }
    
    private String getPaymentStatusMessage(Payment payment) {
        return switch (payment.getStatus()) {
            case SUCCESS -> "Payment completed successfully";
            case FAILED -> "Payment failed: " + (payment.getFailureReason() != null ? payment.getFailureReason() : "Unknown error");
            case PENDING -> "Payment is pending";
            case PROCESSING -> "Payment is being processed";
            case CANCELLED -> "Payment was cancelled";
            case REFUNDED -> "Payment has been refunded";
            case PARTIALLY_REFUNDED -> "Payment has been partially refunded";
        };
    }
    
    // Admin methods
    public Page<Payment> getAllPaymentsPaginated(Pageable pageable) {
        return paymentRepository.findAll(pageable);
    }

    public Payment getPaymentByIdAdmin(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException(id));
    }

    public List<Payment> getPaymentsByBookingId(Long bookingId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getBookingId().equals(bookingId))
                .collect(Collectors.toList());
    }

    public Payment updatePaymentStatus(Long id, PaymentStatus status) {
        Payment payment = getPaymentByIdAdmin(id);
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }

    public Payment refundPayment(Long id) {
        Payment payment = getPaymentByIdAdmin(id);
        
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new PaymentException("Cannot refund payment with status: " + payment.getStatus());
        }
        
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundAmount(payment.getAmount());
        return paymentRepository.save(payment);
    }

    public long getTotalPaymentsCount() {
        return paymentRepository.count();
    }

    public long getSuccessfulPaymentsCount() {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .count();
    }

    public long getFailedPaymentsCount() {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED)
                .count();
    }

    public long getPendingPaymentsCount() {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.PENDING)
                .count();
    }

    public long getRefundedPaymentsCount() {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.REFUNDED || 
                        p.getStatus() == PaymentStatus.PARTIALLY_REFUNDED)
                .count();
    }

    public double getTotalRevenue() {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    public Map<String, Long> getPaymentCountByMethod() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getPaymentMethod().toString(), 
                    Collectors.counting()
                ));
    }

    public Map<String, Long> getPaymentCountByStatus() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getStatus().toString(), 
                    Collectors.counting()
                ));
    }

    public double getTodayRevenue() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        return paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null && 
                        !p.getPaymentTime().isBefore(startOfDay))
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    public double getMonthlyRevenue() {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        return paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null && 
                        !p.getPaymentTime().isBefore(startOfMonth))
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
    }

    public List<Payment> searchPayments(String userId, Long bookingId, String paymentMethod,
                                      PaymentStatus status, LocalDateTime fromDate, 
                                      LocalDateTime toDate, Double minAmount, Double maxAmount) {
        List<Payment> payments = paymentRepository.findAll();
        
        return payments.stream()
                .filter(p -> userId == null || p.getUserId().contains(userId))
                .filter(p -> bookingId == null || p.getBookingId().equals(bookingId))
                .filter(p -> paymentMethod == null || p.getPaymentMethod().toString().equals(paymentMethod))
                .filter(p -> status == null || p.getStatus() == status)
                .filter(p -> fromDate == null || (p.getPaymentTime() != null && !p.getPaymentTime().isBefore(fromDate)))
                .filter(p -> toDate == null || (p.getPaymentTime() != null && !p.getPaymentTime().isAfter(toDate)))
                .filter(p -> minAmount == null || p.getAmount() >= minAmount)
                .filter(p -> maxAmount == null || p.getAmount() <= maxAmount)
                .collect(Collectors.toList());
    }

    public List<Payment> getRecentPayments(int limit) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null)
                .sorted((p1, p2) -> p2.getPaymentTime().compareTo(p1.getPaymentTime()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Payment> getRecentFailedPayments(int limit) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED)
                .filter(p -> p.getPaymentTime() != null)
                .sorted((p1, p2) -> p2.getPaymentTime().compareTo(p1.getPaymentTime()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Map<String, Double> getRevenueByPaymentMethod() {
        List<Payment> payments = paymentRepository.findAll();
        Map<String, Double> revenueMap = new HashMap<>();
        
        for (Payment payment : payments) {
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                String method = payment.getPaymentMethod().toString();
                revenueMap.merge(method, payment.getAmount(), Double::sum);
            }
        }
        
        return revenueMap;
    }

    public Map<LocalDateTime, Double> getRevenueByDate(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        Map<LocalDateTime, Double> revenueMap = new HashMap<>();
        
        paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null && !p.getPaymentTime().isBefore(startDate))
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .forEach(p -> {
                    LocalDateTime date = p.getPaymentTime().toLocalDate().atStartOfDay();
                    revenueMap.merge(date, p.getAmount(), Double::sum);
                });
        
        return revenueMap;
    }

    public int bulkRefundByBooking(Long bookingId) {
        List<Payment> payments = getPaymentsByBookingId(bookingId);
        int refundedCount = 0;
        
        for (Payment payment : payments) {
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                payment.setStatus(PaymentStatus.REFUNDED);
                payment.setRefundAmount(payment.getAmount());
                paymentRepository.save(payment);
                refundedCount++;
            }
        }
        
        return refundedCount;
    }

    public Map<String, Object> getReconciliationReport(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();
        
        List<Payment> payments = paymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null)
                .filter(p -> !p.getPaymentTime().isBefore(startDate) && !p.getPaymentTime().isAfter(endDate))
                .collect(Collectors.toList());
        
        double totalProcessed = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
        
        double totalRefunded = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.REFUNDED || 
                        p.getStatus() == PaymentStatus.PARTIALLY_REFUNDED)
                .mapToDouble(p -> p.getRefundAmount() != null ? p.getRefundAmount() : 0)
                .sum();
        
        report.put("totalTransactions", payments.size());
        report.put("successfulTransactions", payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS).count());
        report.put("failedTransactions", payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED).count());
        report.put("totalProcessedAmount", totalProcessed);
        report.put("totalRefundedAmount", totalRefunded);
        report.put("netRevenue", totalProcessed - totalRefunded);
        report.put("paymentsByMethod", payments.stream()
                .collect(Collectors.groupingBy(
                    p -> p.getPaymentMethod().toString(), 
                    Collectors.counting()
                )));
        
        return report;
    }
}
