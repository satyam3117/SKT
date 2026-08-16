package com.skt.inventory_service.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryRequest {

    Long id;
    String skuCode;
    Integer quantity;
    Integer reservedQuantity;
    Integer availableQuantity;
    String warehouse;

    }
