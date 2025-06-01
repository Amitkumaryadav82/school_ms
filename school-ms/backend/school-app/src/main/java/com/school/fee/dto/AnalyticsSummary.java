package com.school.fee.dto;

import java.util.List;

public class AnalyticsSummary {
    private double totalRevenue;
    private double totalPendingAmount;
    private double overallCollectionRate;
    private double outstandingAmount;
    private double lateFeesCollected;
    private List<MonthlyTrend> monthlyTrends;
    private List<PaymentMethodDistribution> paymentMethodDistribution;
    private List<ClassWiseCollection> classWiseCollection;

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getTotalPendingAmount() {
        return totalPendingAmount;
    }

    public void setTotalPendingAmount(double totalPendingAmount) {
        this.totalPendingAmount = totalPendingAmount;
    }

    public double getOverallCollectionRate() {
        return overallCollectionRate;
    }

    public void setOverallCollectionRate(double overallCollectionRate) {
        this.overallCollectionRate = overallCollectionRate;
    }

    public double getOutstandingAmount() {
        return outstandingAmount;
    }

    public void setOutstandingAmount(double outstandingAmount) {
        this.outstandingAmount = outstandingAmount;
    }

    public double getLateFeesCollected() {
        return lateFeesCollected;
    }

    public void setLateFeesCollected(double lateFeesCollected) {
        this.lateFeesCollected = lateFeesCollected;
    }

    public List<MonthlyTrend> getMonthlyTrends() {
        return monthlyTrends;
    }

    public void setMonthlyTrends(List<MonthlyTrend> monthlyTrends) {
        this.monthlyTrends = monthlyTrends;
    }

    public List<PaymentMethodDistribution> getPaymentMethodDistribution() {
        return paymentMethodDistribution;
    }

    public void setPaymentMethodDistribution(List<PaymentMethodDistribution> paymentMethodDistribution) {
        this.paymentMethodDistribution = paymentMethodDistribution;
    }

    public List<ClassWiseCollection> getClassWiseCollection() {
        return classWiseCollection;
    }

    public void setClassWiseCollection(List<ClassWiseCollection> classWiseCollection) {
        this.classWiseCollection = classWiseCollection;
    }
}
