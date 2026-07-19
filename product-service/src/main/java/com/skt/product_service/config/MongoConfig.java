package com.skt.product_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.core.convert.MongoTypeMapper;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.skt.product_service.repository")
@EnableMongoAuditing
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Override
    protected String getDatabaseName() {
        return "product-service";
    }

    // 1. Explicitly define the MongoTemplate Bean to force it to use your converter
    @Bean
    public MongoTemplate mongoTemplate(
            org.springframework.data.mongodb.MongoDatabaseFactory databaseFactory,
            MappingMongoConverter mappingMongoConverter) {
        return new MongoTemplate(databaseFactory, mappingMongoConverter);
    }

    // 2. Define the converter and attach the type mapper
    @Bean
    public MappingMongoConverter mappingMongoConverter(
            org.springframework.data.mongodb.MongoDatabaseFactory databaseFactory,
            MongoMappingContext customMappingContext) {

        // Use "_class" to store the type metadata, but let Spring look for Type Aliases
        MongoTypeMapper typeMapper = new DefaultMongoTypeMapper("_class");

        MappingMongoConverter converter = new MappingMongoConverter(databaseFactory, customMappingContext);
        converter.setTypeMapper(typeMapper);

        return converter;
    }
}