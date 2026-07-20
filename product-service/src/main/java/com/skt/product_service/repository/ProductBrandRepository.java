package com.skt.product_service.repository;

import com.skt.product_service.model.ProductBrand;
import com.skt.product_service.model.ProductTypeEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductBrandRepository extends MongoRepository<ProductBrand, String> {
    Optional<ProductBrand> findByBrandName(String name);
}