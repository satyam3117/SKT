package com.skt.order_service.repository;

import com.skt.order_service.dto.OrderRequest;
import com.skt.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Integer quantity(Integer quantity);
}
