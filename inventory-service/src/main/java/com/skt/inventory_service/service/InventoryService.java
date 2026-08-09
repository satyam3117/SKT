package com.skt.inventory_service.service;

import com.skt.inventory_service.module.Inventory;
import com.skt.inventory_service.repository.InventoryRepository;
import com.skt.product_service.event.ProductCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public boolean isInStock(String skuCode, Integer quantity) {
        boolean result = inventoryRepository
                .existsBySkuCodeAndQuantityIsGreaterThanEqual(skuCode, quantity);

        log.info("[INVENTORY_CHECK] skuCode={}, requestedQty={}, inStock={}",
                skuCode, quantity, result);

        return result;
    }

    @KafkaListener(
            topics = "product-created-topic",
            groupId = "inventory-group"
    )
    public void handleProductCreated(ProductCreatedEvent event) {

        log.info("[KAFKA_RECEIVED] ProductCreatedEvent received");

        log.debug("[KAFKA_PAYLOAD] productId={}, skuCode={}, initialQty={}",
                event.getProductId(),
                event.getSkuCode(),
                event.getInitialQuantity());

        try {
            Inventory inventory = new Inventory();
            inventory.setSkuCode(event.getSkuCode().toString());
            inventory.setQuantity(event.getInitialQuantity());

            inventoryRepository.save(inventory);

            log.info("[INVENTORY_CREATED] skuCode={}, quantity={} saved successfully",
                    inventory.getSkuCode(),
                    inventory.getQuantity());

        } catch (Exception e) {
            log.error("[INVENTORY_ERROR] Failed to process ProductCreatedEvent skuCode={}",
                    event.getSkuCode(), e);
        }
    }
}