package com.skt.order_service.service;


import com.skt.order_service.client.InventoryClient;
import com.skt.order_service.dto.OrderRequest;
import com.skt.order_service.model.Order;
import com.skt.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {


    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;

    public void placeOrder(OrderRequest orderRequest){

        log.debug("///////////////////////////////");
        var isProductInStock= inventoryClient.isInStock(orderRequest.skuCode(), orderRequest.quantity());

        log.debug("///////////////////////////////" + isProductInStock);

       if(isProductInStock) {
           Order order = new Order();
           order.setOrderNumber(UUID.randomUUID().toString());
           order.setPrice(orderRequest.price());
           order.setSkuCode(orderRequest.skuCode());
           order.setQuantity(orderRequest.quantity());
           orderRepository.save(order);
       } else {
           throw new RuntimeException("Product with SKUCODE : "+ orderRequest.skuCode() + "is not present" );
       }

    }


}
