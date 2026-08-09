package com.skt.inventory_service.repository;

import com.skt.inventory_service.module.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.net.InterfaceAddress;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {


    boolean existsBySkuCodeAndQuantityIsGreaterThanEqual(String skuCode, Integer quantity);

}
