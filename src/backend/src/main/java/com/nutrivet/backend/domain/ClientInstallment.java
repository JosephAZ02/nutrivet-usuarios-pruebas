package com.nutrivet.backend.domain;

import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "client_installment")
public class ClientInstallment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	private double amount; 
	private LocalDate installmentDate; 
	private int idReceivableAccount;

	@Column(name = "client_id", length = 12)
	private String idClient; 

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}

	public LocalDate getInstallmentDate() {
		return installmentDate;
	}

	public void setInstallmentDate(LocalDate installmentDate) {
		this.installmentDate = installmentDate;
	}

	public int getIdReceivableAccount() {
		return idReceivableAccount;
	}

	public void setIdReceivableAccount(int idReceivableAccount) {
		this.idReceivableAccount = idReceivableAccount;
	}

	public String getIdClient() {
		return idClient;
	}

	public void setIdClient(String idClient) {
		this.idClient = idClient;
	}
}