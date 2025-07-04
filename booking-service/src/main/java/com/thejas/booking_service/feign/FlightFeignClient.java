package com.thejas.booking_service.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.thejas.booking_service.dto.FlightResponseDto;
import com.thejas.booking_service.dto.SeatUpdateRequest;

@FeignClient(name = "flight-service", configuration = com.thejas.booking_service.config.FeignConfig.class)
public interface FlightFeignClient {

    @GetMapping("/api/flights/{id}")
    FlightResponseDto getFlightById(@PathVariable("id") String flightId);

      @PostMapping("/api/flights/reduceSeats")
    void reduceSeats(@RequestBody SeatUpdateRequest request);
}
