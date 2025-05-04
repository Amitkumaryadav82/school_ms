package com.school.monitoring;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Service for monitoring application performance metrics.
 * Provides methods to track and record performance data across the application.
 */
@Service
public class PerformanceMonitoringService {

    private final MeterRegistry meterRegistry;
    private final ConcurrentHashMap<String, Timer> timers = new ConcurrentHashMap<>();

    @Autowired
    public PerformanceMonitoringService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    /**
     * Records the duration of an API call.
     *
     * @param apiName        The name of the API or operation
     * @param durationMillis The duration in milliseconds
     */
    public void recordApiCallDuration(String apiName, long durationMillis) {
        Timer timer = getOrCreateTimer(apiName);
        timer.record(durationMillis, TimeUnit.MILLISECONDS);
    }

    /**
     * Starts timing an operation.
     * 
     * @param operationName The name of the operation
     * @return A Timer.Sample that can be used to stop the timer
     */
    public Timer.Sample startTimer() {
        return Timer.start(meterRegistry);
    }

    /**
     * Stops timing an operation and records the duration.
     * 
     * @param sample        The Timer.Sample returned by startTimer()
     * @param operationName The name of the operation
     */
    public void stopTimer(Timer.Sample sample, String operationName) {
        Timer timer = getOrCreateTimer(operationName);
        sample.stop(timer);
    }

    /**
     * Gets an existing timer or creates a new one if it doesn't exist.
     * 
     * @param name The name of the timer
     * @return The Timer instance
     */
    public Timer getOrCreateTimer(String name) {
        return timers.computeIfAbsent(name, key -> Timer.builder("api.call.duration")
                .tag("api", key)
                .description("API call duration")
                .publishPercentileHistogram()
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(meterRegistry));
    }

    /**
     * Records a custom counter metric.
     * 
     * @param metricName The name of the metric
     * @param tags       Additional tags as key-value pairs (must be even length)
     */
    public void incrementCounter(String metricName, String... tags) {
        if (tags.length % 2 != 0) {
            throw new IllegalArgumentException("Tags must be provided as key-value pairs");
        }

        meterRegistry.counter(metricName, tags).increment();
    }
}