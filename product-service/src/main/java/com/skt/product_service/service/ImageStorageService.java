package com.skt.product_service.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ImageStorageService {

    String upload(
            MultipartFile file,
            String skuCode,
            String categoryId
    ) throws IOException;

    void delete(
            String imageUrl,
            String skuCode,
            String categoryId
    ) throws IOException;
}