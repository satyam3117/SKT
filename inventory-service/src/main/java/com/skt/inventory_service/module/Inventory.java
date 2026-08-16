package com.skt.inventory_service.module;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "t_inventory")
@Getter
@NoArgsConstructor
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String skuCode;
    private Integer quantity;
    @Column(nullable = false)
    private Integer reservedQuantity = 0;
    @Column(nullable = false)
    private Integer availableQuantity = 0;
    private String warehouse;

    public Inventory(Long id, String skuCode, Integer quantity, Integer reservedQuantity, String warehouse) {
        this.id = id;
        this.skuCode = skuCode;
        this.quantity = quantity;
        this.reservedQuantity = reservedQuantity == null ? 0 : reservedQuantity;
        this.warehouse = warehouse;
        syncAvailableQuantity();
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSkuCode(String skuCode) {
        this.skuCode = skuCode;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        syncAvailableQuantity();
    }

    public void setReservedQuantity(Integer reservedQuantity) {
        this.reservedQuantity = reservedQuantity == null ? 0 : reservedQuantity;
        syncAvailableQuantity();
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity == null ? 0 : availableQuantity;
    }

    public void setWarehouse(String warehouse) {
        this.warehouse = warehouse;
    }

    @PrePersist
    @PreUpdate
    private void beforeSave() {
        if (reservedQuantity == null) {
            reservedQuantity = 0;
        }
        syncAvailableQuantity();
    }

    private void syncAvailableQuantity() {
        int currentQuantity = quantity == null ? 0 : quantity;
        int currentReservedQuantity = reservedQuantity == null ? 0 : reservedQuantity;
        this.availableQuantity = currentQuantity - currentReservedQuantity;
    }
}
