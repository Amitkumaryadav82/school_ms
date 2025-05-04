package com.school.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for improved application performance.
 * Uses Caffeine caching for optimal performance in a monolithic application.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Cache configuration for development environment.
     * Uses shorter TTL values to facilitate testing.
     */
    @Bean
    @Profile("dev")
    public CacheManager devCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCacheNames(Arrays.asList(
                "students", "teachers", "courses", "grades", "attendance",
                "schedules", "users", "roles", "permissions"));

        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(200)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .recordStats());

        return cacheManager;
    }

    /**
     * Cache configuration for production environment.
     * Uses optimized settings for production workloads.
     */
    @Bean
    @Profile("prod")
    public CacheManager prodCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCacheNames(Arrays.asList(
                "students", "teachers", "courses", "grades", "attendance",
                "schedules", "users", "roles", "permissions", "settings"));

        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .expireAfterAccess(15, TimeUnit.MINUTES)
                .recordStats());

        return cacheManager;
    }
}