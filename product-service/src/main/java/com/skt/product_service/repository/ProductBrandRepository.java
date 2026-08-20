package com.skt.product_service.repository;

import com.skt.product_service.model.ProductBrand;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductBrandRepository
        extends MongoRepository<ProductBrand, String> {

    Optional<ProductBrand> findBySlug(String slug);

    Optional<ProductBrand> findByNameIgnoreCase(String name);

    List<ProductBrand> findByActiveTrueOrderBySortOrderAscNameAsc();

    boolean existsBySlug(String slug);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(
            String name,
            String id
    );
}