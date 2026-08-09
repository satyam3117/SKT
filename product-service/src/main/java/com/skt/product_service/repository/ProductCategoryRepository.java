package com.skt.product_service.repository;

import com.skt.product_service.model.ProductCategoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductCategoryRepository extends MongoRepository<ProductCategoryEntity, String> {
    Optional<ProductCategoryEntity> findByProductCategory(String productCategory);

}