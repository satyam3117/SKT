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

    @Retry(name = "inventory")
    @CircuitBreaker(name = "inventory", fallbackMethod = "fallbackMethod")
    public boolean checkStock(String skuCode, Integer quantity) {
        log.info("Checking inventory stock | SkuCode: {}, Quantity: {}", skuCode, quantity);

        boolean inStock = inventoryClient.isInStock(skuCode, quantity);

        log.debug("Inventory service response received | SkuCode: {}, IsInStock: {}", skuCode, inStock);

        if (!inStock) {
            log.info("Stock check complete: SkuCode {} is OUT OF STOCK for quantity {}", skuCode, quantity);
        } else {
            log.info("Stock check complete: SkuCode {} is IN STOCK", skuCode);
        }

        return inStock;
    }

    /**
     * Fallback method triggered when CircuitBreaker opens or Retries fail.
     * Note: Throwable MUST be the final parameter in the signature.
     */
    public boolean fallbackMethod(String skuCode, Integer quantity, Throwable throwable) {
        // Logging as WARN (or ERROR) with key context and passing the full throwable for root-cause trace
        log.warn("Inventory check fallback triggered | SkuCode: {}, Quantity: {}, Reason: {}",
                skuCode, quantity, throwable.getMessage(), throwable);

        return false;
    }
}