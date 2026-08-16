package com.skt.inventory_service.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockRequest {

    Integer quantity;
    String warehouse;
}
