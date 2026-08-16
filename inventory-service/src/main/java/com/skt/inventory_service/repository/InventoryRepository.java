package com.skt.inventory_service.repository;

import com.skt.inventory_service.module.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    boolean existsBySkuCodeAndAvailableQuantityIsGreaterThanEqual(String skuCode, Integer quantity);

    boolean existsBySkuCode(String skuCode);

    Optional<Inventory> findBySkuCode(String skuCode);
}
