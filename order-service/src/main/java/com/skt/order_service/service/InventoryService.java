package com.skt.order_service.service;

import com.skt.order_service.client.InventoryClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryClient inventoryClient;

    @CircuitBreaker(name = "inventory", fallbackMethod = "fallbackMethod")
    @Retry(name = "inventory")
    public boolean checkStock(String skuCode, Integer quantity) {
        log.info("Checking Inventory for SKU CODE : {}", skuCode);

        boolean x = inventoryClient.isInStock(skuCode, quantity);
        log.info("BOolean value {}",x);

        return x;
    }

    // CRITICAL: The Throwable parameter MUST be the last parameter in the signature
    public boolean fallbackMethod(String skuCode, Integer quantity, Throwable throwable) {
        log.error("Inventory service FAILED for skuCode {}, quantity {}. Reason: {}",
                skuCode, quantity, throwable.getMessage());
        return false;
    }
}
