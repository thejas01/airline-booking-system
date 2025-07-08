package com.example.payment_service.controller;

import com.example.payment_service.dto.PaymentResponseDto;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.enums.PaymentStatus;
import com.example.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<Page<Payment>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") 
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Payment> payments = paymentService.getAllPaymentsPaginated(pageable);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Payment payment = paymentService.getPaymentByIdAdmin(id);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Payment>> getPaymentsByBooking(@PathVariable Long bookingId) {
        List<Payment> payments = paymentService.getPaymentsByBookingId(bookingId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByUser(@PathVariable String userId) {
        List<PaymentResponseDto> payments = paymentService.getPaymentsByUserId(userId);
        return ResponseEntity.ok(payments);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status) {
        
        Payment updatedPayment = paymentService.updatePaymentStatus(id, status);
        return ResponseEntity.ok(updatedPayment);
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<Payment> refundPayment(@PathVariable Long id) {
        Payment refundedPayment = paymentService.refundPayment(id);
        return ResponseEntity.ok(refundedPayment);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPayments", paymentService.getTotalPaymentsCount());
        stats.put("successfulPayments", paymentService.getSuccessfulPaymentsCount());
        stats.put("failedPayments", paymentService.getFailedPaymentsCount());
        stats.put("pendingPayments", paymentService.getPendingPaymentsCount());
        stats.put("refundedPayments", paymentService.getRefundedPaymentsCount());
        stats.put("totalRevenue", paymentService.getTotalRevenue());
        stats.put("paymentsByMethod", paymentService.getPaymentCountByMethod());
        stats.put("paymentsByStatus", paymentService.getPaymentCountByStatus());
        stats.put("todayRevenue", paymentService.getTodayRevenue());
        stats.put("monthlyRevenue", paymentService.getMonthlyRevenue());
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Payment>> searchPayments(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Long bookingId,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount) {
        
        List<Payment> payments = paymentService.searchPayments(
            userId, bookingId, paymentMethod, status, fromDate, toDate, minAmount, maxAmount
        );
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Payment>> getRecentPayments(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Payment> recentPayments = paymentService.getRecentPayments(limit);
        return ResponseEntity.ok(recentPayments);
    }

    @GetMapping("/failed/recent")
    public ResponseEntity<List<Payment>> getRecentFailedPayments(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Payment> failedPayments = paymentService.getRecentFailedPayments(limit);
        return ResponseEntity.ok(failedPayments);
    }

    @GetMapping("/revenue/by-method")
    public ResponseEntity<Map<String, Double>> getRevenueByMethod() {
        Map<String, Double> revenueByMethod = paymentService.getRevenueByPaymentMethod();
        return ResponseEntity.ok(revenueByMethod);
    }

    @GetMapping("/revenue/by-date")
    public ResponseEntity<Map<LocalDateTime, Double>> getRevenueByDate(
            @RequestParam(defaultValue = "30") int days) {
        
        Map<LocalDateTime, Double> revenueByDate = paymentService.getRevenueByDate(days);
        return ResponseEntity.ok(revenueByDate);
    }

    @PostMapping("/bulk-refund")
    public ResponseEntity<Map<String, Object>> bulkRefundPayments(
            @RequestParam Long bookingId) {
        
        int refundedCount = paymentService.bulkRefundByBooking(bookingId);
        Map<String, Object> response = new HashMap<>();
        response.put("refundedPayments", refundedCount);
        response.put("bookingId", bookingId);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/reconciliation")
    public ResponseEntity<Map<String, Object>> getReconciliationReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Map<String, Object> report = paymentService.getReconciliationReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }
}