package com.nutrivet.backend.dto;

import java.time.LocalDateTime;

public class ImportedInvoiceData {

    private String electronicKey;
    private String consecutiveNumber;
    private LocalDateTime emissionDate;
    private String supplierIdentification;
    private String supplierName;
    private String supplierEmail;
    private String saleCondition;
    private Integer creditTerm;
    private String currency;
    private double totalAmount;

    public String getElectronicKey() {
        return electronicKey;
    }

    public void setElectronicKey(String electronicKey) {
        this.electronicKey = electronicKey;
    }

    public String getConsecutiveNumber() {
        return consecutiveNumber;
    }

    public void setConsecutiveNumber(String consecutiveNumber) {
        this.consecutiveNumber = consecutiveNumber;
    }

    public LocalDateTime getEmissionDate() {
        return emissionDate;
    }

    public void setEmissionDate(LocalDateTime emissionDate) {
        this.emissionDate = emissionDate;
    }

    public String getSupplierIdentification() {
        return supplierIdentification;
    }

    public void setSupplierIdentification(String supplierIdentification) {
        this.supplierIdentification = supplierIdentification;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getSupplierEmail() {
        return supplierEmail;
    }

    public void setSupplierEmail(String supplierEmail) {
        this.supplierEmail = supplierEmail;
    }

    public String getSaleCondition() {
        return saleCondition;
    }

    public void setSaleCondition(String saleCondition) {
        this.saleCondition = saleCondition;
    }

    public Integer getCreditTerm() {
        return creditTerm;
    }

    public void setCreditTerm(Integer creditTerm) {
        this.creditTerm = creditTerm;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }
}
