package com.school.fee.dto;

public class RevenueTrendItem {
    private String period;
    private double revenue;
    private double targetRevenue;
    private double growthRate;

    public String getPeriod() {
        return period;
    }

    public void setPeriod(String period) {
        this.period = period;
    }

    public double getRevenue() {
        return revenue;
    }

    public void setRevenue(double revenue) {
        this.revenue = revenue;
    }

    public double getTargetRevenue() {
        return targetRevenue;
    }

    public void setTargetRevenue(double targetRevenue) {
        this.targetRevenue = targetRevenue;
    }

    public double getGrowthRate() {
        return growthRate;
    }

    public void setGrowthRate(double growthRate) {
        this.growthRate = growthRate;
    }
}
