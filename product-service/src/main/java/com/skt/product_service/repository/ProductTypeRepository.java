package com.skt.product_service.repository;

import com.skt.product_service.model.ProductTypeEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductTypeRepository extends MongoRepository<ProductTypeEntity, String> {
}