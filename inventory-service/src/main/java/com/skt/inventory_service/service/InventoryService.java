package com.skt.inventory_service.service;

import com.skt.inventory_service.dto.InventoryResponse;
import com.skt.inventory_service.dto.AvailabilityResponse;
import com.skt.inventory_service.dto.AdjustInventoryResponse;
import com.skt.inventory_service.dto.request.AdjustInventoryRequest;
import com.skt.inventory_service.dto.request.InventoryRequest;
import com.skt.inventory_service.dto.request.StockRequest;
import com.skt.inventory_service.exception.DuplicateSkuCodeException;
import com.skt.inventory_service.exception.InventoryNotFoundException;
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
                .existsBySkuCodeAndAvailableQuantityIsGreaterThanEqual(skuCode, quantity);

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
            inventory.setReservedQuantity(0);

            inventoryRepository.save(inventory);

            log.info("[INVENTORY_CREATED] skuCode={}, quantity={}, reservedQuantity={}, availableQuantity={} saved successfully",
                    inventory.getSkuCode(),
                    inventory.getQuantity(),
                    inventory.getReservedQuantity(),
                    inventory.getAvailableQuantity());

        } catch (Exception e) {
            log.error("[INVENTORY_ERROR] Failed to process ProductCreatedEvent skuCode={}",
                    event.getSkuCode(), e);
        }
    }

    public InventoryResponse createInventory(InventoryRequest inventoryRequest) {

        //check skucode already in db or not
        if (inventoryRepository.existsBySkuCode(inventoryRequest.getSkuCode())) {
            throw new DuplicateSkuCodeException(inventoryRequest.getSkuCode());
        }

        Inventory inventory = new Inventory();
        inventory.setSkuCode(inventoryRequest.getSkuCode());
        inventory.setQuantity(inventoryRequest.getQuantity());
        inventory.setReservedQuantity(inventoryRequest.getReservedQuantity());
        inventory.setAvailableQuantity(inventoryRequest.getAvailableQuantity());
        inventory.setWarehouse(inventoryRequest.getWarehouse());

        inventoryRepository.save(inventory);

        return new InventoryResponse(inventory.getId(), inventory.getSkuCode(), inventory.getQuantity(), inventory.getReservedQuantity(), inventory.getAvailableQuantity(), inventory.getWarehouse());
    }

    public InventoryResponse getInventoryBySkuCode(String skuCode) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new InventoryNotFoundException(skuCode));

        return new InventoryResponse(
                inventory.getId(),
                inventory.getSkuCode(),
                inventory.getQuantity(),
                inventory.getReservedQuantity(),
                inventory.getAvailableQuantity(),
                inventory.getWarehouse()
        );
    }

    public InventoryResponse addStock(String skuCode, StockRequest stockRequest) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new InventoryNotFoundException(skuCode));

        inventory.setQuantity(inventory.getQuantity() + stockRequest.getQuantity());
        inventory.setWarehouse(stockRequest.getWarehouse());

        inventoryRepository.save(inventory);

        return new InventoryResponse(
                inventory.getId(),
                inventory.getSkuCode(),
                inventory.getQuantity(),
                inventory.getReservedQuantity(),
                inventory.getAvailableQuantity(),
                inventory.getWarehouse()
        );
    }

    public AdjustInventoryResponse adjustInventory(String skuCode, AdjustInventoryRequest adjustInventoryRequest) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new InventoryNotFoundException(skuCode));

        inventory.setQuantity(inventory.getQuantity() + adjustInventoryRequest.getQuantity());
        inventoryRepository.save(inventory);

        return new AdjustInventoryResponse(
                inventory.getSkuCode(),
                inventory.getQuantity(),
                inventory.getReservedQuantity(),
                inventory.getAvailableQuantity(),
                inventory.getWarehouse()
        );
    }

    public AvailabilityResponse getAvailability(String skuCode, Integer quantity) {
        Inventory inventory = inventoryRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new InventoryNotFoundException(skuCode));

        return new AvailabilityResponse(
                inventory.getSkuCode(),
                quantity,
                inventory.getAvailableQuantity(),
                inventory.getAvailableQuantity() != null && inventory.getAvailableQuantity() >= quantity
        );
    }
}