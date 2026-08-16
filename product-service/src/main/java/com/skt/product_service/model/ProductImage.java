package com.skt.product_service.model;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductImage {

    private String id;
    private String imageUrl;
    private Integer position;


    public ProductImage(String id, String imageUrl, Integer position) {
        this.id = id;
        this.imageUrl = imageUrl;
        this.position = position;
    }

}
