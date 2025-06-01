package com.school.fee.dto;

public class PaymentAnalytics {
    private double totalPaymentsAmount;
    private int totalPaymentsCount;
    private double averagePaymentAmount;
    private double highestPaymentAmount;
    private double lowestPaymentAmount;
    private double onlinePaymentsPercentage;
    private double cashPaymentsPercentage;
    private double chequePaymentsPercentage;

    public double getTotalPaymentsAmount() {
        return totalPaymentsAmount;
    }

    public void setTotalPaymentsAmount(double totalPaymentsAmount) {
        this.totalPaymentsAmount = totalPaymentsAmount;
    }

    public int getTotalPaymentsCount() {
        return totalPaymentsCount;
    }

    public void setTotalPaymentsCount(int totalPaymentsCount) {
        this.totalPaymentsCount = totalPaymentsCount;
    }

    public double getAveragePaymentAmount() {
        return averagePaymentAmount;
    }

    public void setAveragePaymentAmount(double averagePaymentAmount) {
        this.averagePaymentAmount = averagePaymentAmount;
    }

    public double getHighestPaymentAmount() {
        return highestPaymentAmount;
    }

    public void setHighestPaymentAmount(double highestPaymentAmount) {
        this.highestPaymentAmount = highestPaymentAmount;
    }

    public double getLowestPaymentAmount() {
        return lowestPaymentAmount;
    }

    public void setLowestPaymentAmount(double lowestPaymentAmount) {
        this.lowestPaymentAmount = lowestPaymentAmount;
    }

    public double getOnlinePaymentsPercentage() {
        return onlinePaymentsPercentage;
    }

    public void setOnlinePaymentsPercentage(double onlinePaymentsPercentage) {
        this.onlinePaymentsPercentage = onlinePaymentsPercentage;
    }

    public double getCashPaymentsPercentage() {
        return cashPaymentsPercentage;
    }

    public void setCashPaymentsPercentage(double cashPaymentsPercentage) {
        this.cashPaymentsPercentage = cashPaymentsPercentage;
    }

    public double getChequePaymentsPercentage() {
        return chequePaymentsPercentage;
    }

    public void setChequePaymentsPercentage(double chequePaymentsPercentage) {
        this.chequePaymentsPercentage = chequePaymentsPercentage;
    }
}
