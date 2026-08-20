package com.skt.product_service.repository;

import com.skt.product_service.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findAllByProductCategoryIgnoreCase(String productCategory);

    boolean existsBySkuCode(String skuCode);

    List<Product> findAllBybrandIdIgnoreCase(String brandId);

    boolean existsByBrandId(String brandId);


}
