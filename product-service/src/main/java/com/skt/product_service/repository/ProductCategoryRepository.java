package com.skt.product_service.repository;

import com.skt.product_service.model.ProductCategoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductCategoryRepository
        extends MongoRepository<ProductCategoryEntity, String> {

    Optional<ProductCategoryEntity> findBySlug(String slug);

    List<ProductCategoryEntity> findByParentId(String parentId);

    List<ProductCategoryEntity>
    findByParentIdAndActiveTrueOrderBySortOrderAsc(
            String parentId
    );

    List<ProductCategoryEntity>
    findByParentIdIsNullAndActiveTrueOrderBySortOrderAsc();

    List<ProductCategoryEntity>
    findByActiveTrueOrderByLevelAscSortOrderAscNameAsc();

    boolean existsBySlug(String slug);

    boolean existsByNameAndParentId(
            String name,
            String parentId
    );

    boolean existsByNameAndParentIdIsNull(
            String name
    );

    boolean existsByNameAndParentIdAndIdNot(
            String name,
            String parentId,
            String id
    );

    boolean existsByNameAndParentIdIsNullAndIdNot(
            String name,
            String id
    );
}