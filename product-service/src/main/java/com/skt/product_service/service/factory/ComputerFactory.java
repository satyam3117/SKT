package com.skt.product_service.service.factory;

import com.skt.product_service.dto.ProductRequest;
import com.skt.product_service.model.Computer;
import com.skt.product_service.model.Product;
import com.skt.product_service.model.ProductType;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

@Component
public class ComputerFactory implements ProductFactory {

    @Override
    public Product create(ProductRequest request) {
        return Computer.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .processor(request.processor())
                .ramGb(request.ramGb() != null ? request.ramGb() : StringUtils.EMPTY)
                .storageGb(request.storageGb() != null ? request.storageGb() : StringUtils.EMPTY)
                .graphics(request.graphics() != null ? request.graphics() : StringUtils.EMPTY)
                .mouse(request.mouse() != null ? request.mouse() : StringUtils.EMPTY)
                .keyboard(request.keyboard() != null ? request.keyboard() : StringUtils.EMPTY)
                .build();
    }

    @Override
    public Product update(Product existingProduct, ProductRequest request) {
        Computer existingComputer = (Computer) existingProduct;
        return Computer.builder()
                .id(existingComputer.getId()) // Crucial: Keep the original MongoDB ID
                .name(request.name() != null ? request.name() : existingComputer.getName())
                .description(request.description() != null ? request.description() : existingComputer.getDescription())
                .price(request.price() != null ? request.price() : existingComputer.getPrice())
                .processor(request.processor() != null ? request.processor() : existingComputer.getProcessor())
                .ramGb(request.ramGb() != null ? request.ramGb() : existingComputer.getRamGb())
                .storageGb(request.storageGb() != null ? request.storageGb() : existingComputer.getStorageGb())
                .graphics(request.graphics() != null ? request.graphics() : existingComputer.getGraphics())
                .mouse(request.mouse() != null ? request.mouse() : existingComputer.getMouse())
                .keyboard(request.keyboard() != null ? request.keyboard() : existingComputer.getKeyboard())
                .build();
    }

    @Override
    public String productType() {
        return "COMPUTER";
    }

}