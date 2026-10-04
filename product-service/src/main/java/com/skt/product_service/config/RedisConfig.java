package com.skt.product_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skt.product_service.dto.CachedProduct;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Map;

@Configuration
public class RedisConfig implements CachingConfigurer {

    public static final String PRODUCT_CACHE = "products";
    public static final String CATEGORY_CACHE = "categories";
    public static final String BRAND_CACHE = "brands";

    private static final Logger log =
            LoggerFactory.getLogger(RedisConfig.class);

    @Bean
    public CacheManager cacheManager(
            RedisConnectionFactory connectionFactory,
            ObjectMapper objectMapper
    ) {

        /*
         * ============================================================
         * PRODUCT CACHE
         * ============================================================
         *
         * Product-by-ID changes less frequently than temporary
         * catalog/search data.
         */
        Jackson2JsonRedisSerializer<CachedProduct>
                productSerializer =
                new Jackson2JsonRedisSerializer<>(
                        objectMapper,
                        CachedProduct.class
                );

        RedisCacheConfiguration productConfig =
                RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofHours(2))
                        .disableCachingNullValues()
                        .serializeValuesWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(productSerializer)
                        );


        /*
         * ============================================================
         * CATEGORY CACHE
         * ============================================================
         *
         * Category data changes infrequently.
         */
        GenericJackson2JsonRedisSerializer categorySerializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration categoryConfig =
                RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofHours(6))
                        .disableCachingNullValues()
                        .serializeValuesWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(categorySerializer)
                        );


        /*
         * ============================================================
         * BRAND CACHE
         * ============================================================
         *
         * Brand metadata also changes infrequently.
         */
        GenericJackson2JsonRedisSerializer brandSerializer =
                new GenericJackson2JsonRedisSerializer(objectMapper);

        RedisCacheConfiguration brandConfig =
                RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofHours(6))
                        .disableCachingNullValues()
                        .serializeValuesWith(
                                RedisSerializationContext.SerializationPair
                                        .fromSerializer(brandSerializer)
                        );


        /*
         * ============================================================
         * CACHE MANAGER
         * ============================================================
         */
        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(
                        RedisCacheConfiguration.defaultCacheConfig()
                                .disableCachingNullValues()
                )
                .withInitialCacheConfigurations(
                        Map.of(
                                PRODUCT_CACHE, productConfig,
                                CATEGORY_CACHE, categoryConfig,
                                BRAND_CACHE, brandConfig
                        )
                )
                .build();
    }


    /*
     * ================================================================
     * REDIS FAILURE HANDLING
     * ================================================================
     *
     * Redis is a cache, not the source of truth.
     *
     * If Redis is unavailable:
     *
     * GET  -> continue to MongoDB
     * PUT  -> MongoDB operation still succeeds
     * EVICT -> MongoDB operation still succeeds
     *
     * This prevents a Redis outage from taking down product APIs.
     */

    @Bean
    @Override
    public CacheErrorHandler errorHandler() {

        return new CacheErrorHandler() {

            @Override
            public void handleCacheGetError(
                    RuntimeException exception,
                    Cache cache,
                    Object key
            ) {
                log.warn(
                        "Cache GET failed. cache={}, key={}",
                        cache.getName(),
                        key,
                        exception
                );
            }

            @Override
            public void handleCachePutError(
                    RuntimeException exception,
                    Cache cache,
                    Object key,
                    Object value
            ) {
                log.warn(
                        "Cache PUT failed. cache={}, key={}",
                        cache.getName(),
                        key,
                        exception
                );
            }

            @Override
            public void handleCacheEvictError(
                    RuntimeException exception,
                    Cache cache,
                    Object key
            ) {
                log.warn(
                        "Cache EVICT failed. cache={}, key={}",
                        cache.getName(),
                        key,
                        exception
                );
            }

            @Override
            public void handleCacheClearError(
                    RuntimeException exception,
                    Cache cache
            ) {
                log.warn(
                        "Cache CLEAR failed. cache={}",
                        cache.getName(),
                        exception
                );
            }
        };
    }

}