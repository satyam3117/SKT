package com.skt.order_service.service;


import com.skt.order_service.client.InventoryClient;
import com.skt.order_service.dto.OrderRequest;
import com.skt.order_service.model.Order;
import com.skt.order_service.order.event.OrderPlacedEvent;
import com.skt.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {


    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final KafkaTemplate<String, OrderPlacedEvent> kafkaTemplate;
    public void placeOrder(OrderRequest orderRequest){

        var isProductInStock = inventoryService.checkStock(orderRequest.skuCode(), orderRequest.quantity());

       if(isProductInStock) {
           Order order = new Order();
           order.setOrderNumber(UUID.randomUUID().toString());
           order.setPrice(orderRequest.price());
           order.setSkuCode(orderRequest.skuCode());
           order.setQuantity(orderRequest.quantity());
           order.setEmail(orderRequest.email());
           order.setFirstName(orderRequest.firstName());
           order.setLastName(orderRequest.lastName());
           orderRepository.save(order);


           //Send Message to Kakfa Topic
           //order number and Email
           OrderPlacedEvent orderPlacedEvent = new OrderPlacedEvent();
           orderPlacedEvent.setOrderNumber(order.getOrderNumber());
           orderPlacedEvent.setEmail(order.getEmail());
           orderPlacedEvent.setFirstName(order.getFirstName());
           orderPlacedEvent.setLastName(order.getLastName());
           log.info("Start - Sending OrderPlacedEvent {} to Kafka topic order-placed", orderPlacedEvent);
           kafkaTemplate.send("order-placed", orderPlacedEvent);
           log.info("End - Sending OrderPlacedEvent {} to Kafka topic order-placed", orderPlacedEvent);



       } else {
           log.error("Product with SKUCODE : "+ orderRequest.skuCode() + "is not present" );
       }

    }


}
