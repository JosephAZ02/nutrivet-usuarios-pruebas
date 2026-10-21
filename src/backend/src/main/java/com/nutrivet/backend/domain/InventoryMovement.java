package com.nutrivet.backend.domain;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "inventory_movement")
public class InventoryMovement {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	private String type;
	private int amount;
	private LocalDate movementDate;
	private int idProduct;

	@Column(name = "invoice_id", nullable = true)
	private Integer idInvoice;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getAmount() {
		return amount;
	}

	public void setAmount(int amount) {
		this.amount = amount;
	}

	public LocalDate getMovementDate() {
		return movementDate;
	}

	public void setMovementDate(LocalDate movementDate) {
		this.movementDate = movementDate;
	}

	public int getIdProduct() {
		return idProduct;
	}

	public void setIdProduct(int idProduct) {
		this.idProduct = idProduct;
	}

	public Integer getIdInvoice() {
		return idInvoice;
	}

	public void setIdInvoice(Integer idInvoice) {
		this.idInvoice = idInvoice;
	}
}
