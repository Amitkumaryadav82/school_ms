package com.school.fee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight DTO used to serialize payment data to clients and avoid
 * exposing JPA entities (prevents LazyInitialization issues).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
	private Long id;
	private Long studentId;
	private Long feeId;
	private Double amount;
	/**
	 * ISO-8601 timestamp string (LocalDateTime.toString()).
	 */
	private String paymentDate;
	private String paymentMethod; // e.g., CASH, CARD, UPI
	private String status;        // e.g., COMPLETED, PENDING
	private String transactionReference;
	private String remarks;
	private String receiptNumber;
	// Payer details captured at time of payment
	private String payerName;
	private String payerContactInfo;
	private String payerRelationToStudent;
}
