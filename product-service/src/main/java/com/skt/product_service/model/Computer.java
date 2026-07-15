package com.skt.product_service.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.TypeAlias;

@NoArgsConstructor
@SuperBuilder
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@TypeAlias("computer")
public class Computer extends Product {

    private String processor;
    private String ramGb;
    private String storageGb;
    private String screenSize;
    private String graphics;
    private String mouse;
    private String keyboard;

}