import type { ReactElement } from "react";
import type { Invoice, InvoiceExportLineApi, InvoiceExportPreviewRow, PaymentResult } from "@/core/types/invoice";

// open-invoice refNo cells render a <Link to="...">refNo</Link> instead of a plain string.
function refNoText(cell: unknown): string {
	if (typeof cell === "string") return cell;
	return String((cell as ReactElement<{ children: string }>).props.children);
}

// An invoice marked as partly paid: the old builder used this to synthesise a receipt row.
const previewRowsWithPayment: InvoiceExportPreviewRow[] = [
	{ refNo: "IN000145530", quantity: 5, amount: 330600, paid: 100000, balance: 230600 } as InvoiceExportPreviewRow,
];

import {
	buildCustomerTransactionDetailByTypeRows,
	buildOpenInvoiceRows,
	buildReceiptDetailRows,
	buildSaleDetailRows,
} from "./invoice-detail-builders";

const invoices: Invoice[] = [
	{
		id: "invoice-1",
		refNo: "IN000145530",
		customerName: "Customer A",
		amount: 330600,
		date: "2026-06-09",
		type: "invoice",
	},
	{
		id: "invoice-2",
		refNo: "CS000145494",
		customerName: "Customer B",
		amount: 102600,
		date: "2026-06-09",
		type: "cash_sale",
	},
	{
		id: "invoice-3",
		refNo: "IN000145531",
		customerName: "Customer A",
		amount: 100000,
		date: "2026-06-10",
		type: "invoice",
	},
];

const exportLines: InvoiceExportLineApi[] = [
	{
		refNo: "IN000145530",
		customerName: "Customer A",
		date: "2026-06-09",
		productName: "Service A",
		quantity: 174,
		pricePerProduct: 1900,
		amount: 330600,
		total: 330600,
	},
	{
		refNo: "CS000145494",
		customerName: "Customer B",
		date: "2026-06-09",
		productName: "Service B",
		quantity: 54,
		pricePerProduct: 1900,
		amount: 102600,
		total: 102600,
	},
];

describe("invoice detail builders", () => {
	it("groups sale detail rows by customer and appends subtotals", () => {
		const rows = buildSaleDetailRows(invoices, exportLines);

		expect(rows).toHaveLength(6);
		expect(rows[0]?.cells.customer).toBe("Customer A");
		expect(refNoText(rows[1]?.cells.refNo)).toBe("IN000145530");
		expect(rows[2]?.cells.item).toBe("TOTAL(1)");
		expect(rows[2]?.cells.qty).toBe("174");
		expect(rows[3]?.cells.customer).toBe("Customer B");
		expect(refNoText(rows[4]?.cells.refNo)).toBe("CS000145494");
		expect(rows[5]?.cells.item).toBe("TOTAL(1)");
		expect(rows[5]?.cells.amount).toBe("102,600");
	});

	it("builds open invoice rows grouped by customer in detail mode", () => {
		const rows = buildOpenInvoiceRows(invoices, [], [], true);
		// Customer A: Header, Detail 1, Detail 2, Subtotal -> 4 rows
		// Customer B: Header, Detail 1, Subtotal -> 3 rows
		// Grand Total -> 1 row
		expect(rows).toHaveLength(8);
		expect(rows[0]?.cells.customer).toBe("Customer A");
		expect(refNoText(rows[1]?.cells.refNo)).toBe("IN000145530");
		expect(refNoText(rows[2]?.cells.refNo)).toBe("IN000145531");
		expect(rows[3]?.cells.employee).toBe("Total(2)");
		expect(rows[3]?.cells.originalAmount).toBe("430,600");
		expect(rows[4]?.cells.customer).toBe("Customer B");
		expect(refNoText(rows[5]?.cells.refNo)).toBe("CS000145494");
		expect(rows[6]?.cells.employee).toBe("Total(1)");
		expect(rows[6]?.cells.originalAmount).toBe("102,600");
		expect(rows[7]?.cells.customer).toBe("Grand Total (3)");
		expect(rows[7]?.cells.originalAmount).toBe("533,200");
	});

	it("builds receipt detail rows with customer payments", () => {
		const receiptInvoices: Invoice[] = [
			...invoices,
			{
				id: "invoice-4",
				refNo: "REC000001",
				customerName: "Customer A",
				amount: 100000,
				date: "2026-06-11",
				type: "receipt",
			},
		];
		const previewRows: InvoiceExportPreviewRow[] = [
			{
				refNo: "REC000001",
				amount: 100000,
				paid: 100000,
				balance: 0,
			} as InvoiceExportPreviewRow,
		];
		const rows = buildReceiptDetailRows(receiptInvoices, previewRows, true);
		expect(rows.length).toBeGreaterThan(0);
		expect(rows[0]?.cells.customer).toBe("Customer A");
		expect(refNoText(rows[1]?.cells.refNo)).toBe("REC000001");
		// buildReceiptDetailRows doesn't take a payments param — getOpenInvoiceMetrics's cycleId-based
		// received defaults to 0 here. previewRow.paid was never real data anyway (always null on the
		// live API); this report's received/balance is deferred (task #6), not fixed by this change.
		expect(rows[1]?.cells.received).toBe("0");
	});

	it("builds receipt detail rows directly from payment records when previewRows is empty", () => {
		const receiptInvoices: Invoice[] = [
			{
				id: "pay-1",
				refNo: "IN000017939",
				customerName: "Customer A",
				amount: 50000,
				received: 50000,
				originalAmount: 50000,
				balance: 0,
				date: "2026-08-29",
				type: "receipt",
			} as any,
		];
		const rows = buildReceiptDetailRows(receiptInvoices, [], true);
		expect(rows.length).toBeGreaterThan(0);
		expect(rows[0]?.cells.customer).toBe("Customer A");
		expect(refNoText(rows[1]?.cells.refNo)).toBe("IN000017939");
		expect(rows[1]?.cells.received).toBe("50,000");
		expect(rows[1]?.cells.originalAmount).toBe("50,000");
		expect(rows[1]?.cells.balance).toBe("0");
	});

	it("renders nothing when there is no data, instead of demo rows", () => {
		expect(buildOpenInvoiceRows([], [], [], true)).toEqual([]);
		expect(buildReceiptDetailRows([], [], true)).toEqual([]);
	});

	it("computes received/balance per invoice via cycleId match against /payments", () => {
		// PaymentResult has no invoiceId (real schema) — matching goes through cycleId instead.
		// IN000145530 and IN000145531 (Customer A) sit in different cycles here, each with its own payment.
		const previewRows: InvoiceExportPreviewRow[] = [
			{ refNo: "IN000145530", cycleId: "cycle-1", amount: 330600 } as InvoiceExportPreviewRow,
			{ refNo: "IN000145531", cycleId: "cycle-2", amount: 100000 } as InvoiceExportPreviewRow,
		];
		const payments: PaymentResult[] = [
			{ cycleId: "cycle-1", amount: 100000 },
			{ cycleId: "cycle-2", amount: 50000 },
		];
		const rows = buildOpenInvoiceRows(invoices, previewRows, payments, true);

		const detail1 = rows.find((row) => refNoText(row.cells.refNo) === "IN000145530");
		expect(detail1?.cells.received).toBe("-100,000");
		expect(detail1?.cells.balance).toBe("230,600");
		const detail2 = rows.find((row) => refNoText(row.cells.refNo) === "IN000145531");
		expect(detail2?.cells.received).toBe("-50,000");
		expect(detail2?.cells.balance).toBe("50,000");

		const subtotalRow = rows.find((row) => row.cells.employee === "Total(2)");
		expect(subtotalRow?.cells.received).toBe("-150,000");
		expect(subtotalRow?.cells.balance).toBe("280,600");
		const grandTotalRow = rows.find((row) => row.key === "open-inv-grand-total");
		expect(grandTotalRow?.cells.received).toBe("-150,000");
	});

	it("dedupes cycle received once when multiple invoices share the same cycle", () => {
		const previewRows: InvoiceExportPreviewRow[] = [
			{ refNo: "IN000145530", cycleId: "cycle-shared", amount: 330600 } as InvoiceExportPreviewRow,
			{ refNo: "IN000145531", cycleId: "cycle-shared", amount: 100000 } as InvoiceExportPreviewRow,
		];
		const payments: PaymentResult[] = [{ cycleId: "cycle-shared", amount: 80000 }];
		const rows = buildOpenInvoiceRows(invoices, previewRows, payments, true);

		// Only the first invoice of the shared cycle shows the payment — showing it on every invoice
		// in the cycle would look like the payment happened once per invoice instead of once total.
		const detail1 = rows.find((row) => refNoText(row.cells.refNo) === "IN000145530");
		expect(detail1?.cells.received).toBe("-80,000");
		expect(detail1?.cells.balance).toBe("250,600");
		const detail2 = rows.find((row) => refNoText(row.cells.refNo) === "IN000145531");
		expect(detail2?.cells.received).toBe("");
		expect(detail2?.cells.balance).toBe("100,000");

		// Subtotal counts the shared cycle's payment once, not once per invoice (not 160,000).
		const subtotalRow = rows.find((row) => row.cells.employee === "Total(2)");
		expect(subtotalRow?.cells.received).toBe("-80,000");
		expect(subtotalRow?.cells.balance).toBe("350,600");
	});

	it("omits fully-paid invoices from the open invoice report", () => {
		// received now comes from /payments matched by cycleId, not from previewRow.paid (always null
		// on the live API).
		const paidPreviews: InvoiceExportPreviewRow[] = [
			{ refNo: "IN000145530", cycleId: "cycle-a", amount: 330600 } as InvoiceExportPreviewRow,
			{ refNo: "CS000145494", cycleId: "cycle-b", amount: 102600 } as InvoiceExportPreviewRow,
			{ refNo: "IN000145531", cycleId: "cycle-c", amount: 100000 } as InvoiceExportPreviewRow,
		];
		const payments: PaymentResult[] = [
			{ cycleId: "cycle-a", amount: 330600 },
			{ cycleId: "cycle-b", amount: 102600 },
		];
		const rows = buildOpenInvoiceRows(invoices, paidPreviews, payments, true);

		// Only IN000145531 still carries a balance, so Customer B drops out entirely.
		expect(rows.map((row) => refNoText(row.cells.refNo))).toContain("IN000145531");
		expect(rows.map((row) => refNoText(row.cells.refNo))).not.toContain("CS000145494");
		expect(rows.some((row) => row.cells.customer === "Customer B")).toBe(false);
	});

	it("builds customer transaction detail by type with invoices on top and receipts on bottom conditionally", () => {
		const previewRows: InvoiceExportPreviewRow[] = [
			{
				refNo: "IN000145530",
				quantity: 5,
				amount: 330600,
				paid: 100000,
				balance: 230600,
			} as InvoiceExportPreviewRow,
			{
				refNo: "CS000145494",
				quantity: 2,
				amount: 102600,
				paid: 0,
				balance: 102600,
			} as InvoiceExportPreviewRow,
		];
		// customerName is read from the real payment record; a blank/missing one falls back to
		// "Unknown Customer".
		const payments: PaymentResult[] = [
			{ id: "pay-1", code: "REC000009", paymentDate: "2026-06-12", amount: 100000, customerName: "Customer A" },
			{ id: "pay-2", code: "REC000010", paymentDate: "2026-06-13", amount: 50000, customerName: "  " },
		];
		const rows = buildCustomerTransactionDetailByTypeRows(invoices, previewRows, payments);

		// Section 1: Invoice banner exists
		expect(rows.some((r) => r.cells.date === "Invoice")).toBe(true);
		// Invoices include Customer A and Customer B
		expect(rows.some((r) => r.cells.date === "Customer A")).toBe(true);
		expect(rows.some((r) => r.cells.date === "Customer B")).toBe(true);
		// Invoice Total exists
		expect(rows.some((r) => typeof r.cells.dueDate === "string" && r.cells.dueDate.startsWith("Total Invoice"))).toBe(
			true,
		);

		// Section 2: Receipt banner exists
		expect(rows.some((r) => r.cells.date === "Receipt")).toBe(true);
		const receiptRows = rows.slice(rows.findIndex((r) => r.cells.date === "Receipt"));
		// A payment with a real customerName groups its receipt row under that name.
		expect(receiptRows.some((r) => r.cells.date === "Customer A")).toBe(true);
		// A payment with a blank/missing customerName still falls back to "Unknown Customer".
		expect(receiptRows.some((r) => r.cells.date === "Unknown Customer")).toBe(true);
	});

	it("shows the real payment reference, never one derived from the invoice", () => {
		const payments: PaymentResult[] = [{ id: "pay-1", code: "REC000009", paymentDate: "2026-06-12", amount: 100000 }];
		const rows = buildCustomerTransactionDetailByTypeRows(invoices, [], payments);
		const receiptRow = rows.find((row) => row.key.startsWith("tx-rcp-row-"));

		expect(receiptRow?.cells.refNo).toBe("REC000009");
		// "REC-IN000145530" was a string invented from the invoice; no such document exists.
		expect(rows.every((row) => !String(row.cells.refNo ?? "").startsWith("REC-IN"))).toBe(true);
	});

	it("links the invoice refNo to invoice export-preview", () => {
		const rows = buildCustomerTransactionDetailByTypeRows(invoices, previewRowsWithPayment, []);
		const invoiceRow = rows.find((row) => row.key.startsWith("tx-inv-row-") && row.key.includes("IN000145530"));
		const cell = invoiceRow?.cells.refNo as ReactElement<{ to: string }>;
		expect(cell.props.to).toBe("/dashboard/invoice/export-preview?ids=invoice-1");
	});

	it("links the receipt refNo to receipt-preview for invoices sharing the payment's cycle", () => {
		const previewRows: InvoiceExportPreviewRow[] = [
			{ refNo: "IN000145530", cycleId: "cycle-x", amount: 330600 } as InvoiceExportPreviewRow,
		];
		const payments: PaymentResult[] = [{ id: "pay-1", code: "REC000009", cycleId: "cycle-x", amount: 100000 }];
		const rows = buildCustomerTransactionDetailByTypeRows(invoices, previewRows, payments);
		const receiptRow = rows.find((row) => row.key.startsWith("tx-rcp-row-"));
		const cell = receiptRow?.cells.refNo as ReactElement<{ to: string }>;
		expect(cell.props.to).toBe("/dashboard/invoice/receipt-preview?ids=invoice-1&mode=receipt");
	});

	it("leaves the receipt refNo as plain text when no invoice shares the payment's cycle", () => {
		const payments: PaymentResult[] = [{ id: "pay-1", code: "REC000009", cycleId: "cycle-unmatched", amount: 100000 }];
		const rows = buildCustomerTransactionDetailByTypeRows(invoices, previewRowsWithPayment, payments);
		const receiptRow = rows.find((row) => row.key.startsWith("tx-rcp-row-"));
		expect(receiptRow?.cells.refNo).toBe("REC000009");
	});

	it("omits the receipt section entirely when no payments were recorded", () => {
		const rows = buildCustomerTransactionDetailByTypeRows(invoices, previewRowsWithPayment, []);

		expect(rows.some((row) => row.cells.date === "Invoice")).toBe(true);
		expect(rows.some((row) => row.cells.date === "Receipt")).toBe(false);
	});

	it("shows the receipt section when there are payments even if invoices are empty", () => {
		const payments: PaymentResult[] = [{ id: "pay-1", code: "REC000009", paymentDate: "2026-06-12", amount: 100000 }];
		const rows = buildCustomerTransactionDetailByTypeRows([], [], payments);

		expect(rows.some((row) => row.cells.date === "Invoice")).toBe(false);
		expect(rows.some((row) => row.cells.date === "Receipt")).toBe(true);
		expect(rows.some((row) => row.cells.refNo === "REC000009")).toBe(true);
	});
});
