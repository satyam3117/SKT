package com.skt.order_service.controller;

import com.skt.order_service.dto.OrderRequest;
import com.skt.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
@Slf4j // 1. Adds SLF4J Logger instance automatically as 'log'
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public String placeOrder(@RequestBody OrderRequest orderRequest){
        // 2. High-level business tracking (INFO)
        log.info("Received request to place a new order.");

        // 3. Detailed payload inspection for debugging (DEBUG)
        log.debug("Order payload received: {}", orderRequest);

        orderService.placeOrder(orderRequest);

        // 4. Success state logging (INFO)
        log.info("Order placed successfully.");

        return "Order Placed Successfully";
    }
}