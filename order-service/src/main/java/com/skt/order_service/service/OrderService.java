package com.skt.order_service.service;

import com.skt.order_service.dto.OrderRequest;
import com.skt.order_service.model.Order;
import com.skt.order_service.order.event.OrderPlacedEvent;
import com.skt.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
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

    public void placeOrder(OrderRequest orderRequest) {
        log.info("Initiating order placement process | SkuCode: {}, Quantity: {}",
                orderRequest.skuCode(), orderRequest.quantity());

        boolean isProductInStock = inventoryService.checkStock(orderRequest.skuCode(), orderRequest.quantity());

        if (isProductInStock) {
            // 1. Build and persist Order
            Order order = new Order();
            order.setOrderNumber(UUID.randomUUID().toString());
            order.setPrice(orderRequest.price());
            order.setSkuCode(orderRequest.skuCode());
            order.setQuantity(orderRequest.quantity());
            order.setEmail(orderRequest.email());
            order.setFirstName(orderRequest.firstName());
            order.setLastName(orderRequest.lastName());

            orderRepository.save(order);
            log.info("Order successfully created and saved | OrderNumber: {}, SkuCode: {}",
                    order.getOrderNumber(), order.getSkuCode());

            // 2. Prepare Kafka Event
            OrderPlacedEvent orderPlacedEvent = new OrderPlacedEvent();
            orderPlacedEvent.setOrderNumber(order.getOrderNumber());
            orderPlacedEvent.setEmail(order.getEmail());
            orderPlacedEvent.setFirstName(order.getFirstName());
            orderPlacedEvent.setLastName(order.getLastName());

            log.debug("Publishing OrderPlacedEvent to Kafka | OrderNumber: {}, EventPayload: {}",
                    order.getOrderNumber(), orderPlacedEvent);

            // 3. Asynchronous Kafka Dispatch with Confirmation Logging
            kafkaTemplate.send("order-placed", orderPlacedEvent)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("Kafka notification published successfully | Topic: order-placed, OrderNumber: {}, Offset: {}",
                                    order.getOrderNumber(), result.getRecordMetadata().offset());
                        } else {
                            log.error("Failed to publish notification to Kafka | Topic: order-placed, OrderNumber: {}, Reason: {}",
                                    order.getOrderNumber(), ex.getMessage(), ex);
                        }
                    });

        } else {
            // 4. Stock Unavailable Failure Logging
            log.warn("Order placement aborted: Out of stock | SkuCode: {}, RequestedQuantity: {}",
                    orderRequest.skuCode(), orderRequest.quantity());

            // Note: Consider throwing a domain exception here (e.g., OutOfStockException)
            // so your REST Controller can map it to a proper 400/409 HTTP status code.
        }
    }
}