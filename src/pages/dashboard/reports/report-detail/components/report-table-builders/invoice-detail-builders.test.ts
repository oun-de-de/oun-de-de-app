import type { Invoice, InvoiceExportLineApi, InvoiceExportPreviewRow } from "@/core/types/invoice";
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
		expect(rows[1]?.cells.refNo).toBe("IN000145530");
		expect(rows[2]?.cells.item).toBe("TOTAL(1)");
		expect(rows[2]?.cells.qty).toBe("174");
		expect(rows[3]?.cells.customer).toBe("Customer B");
		expect(rows[4]?.cells.refNo).toBe("CS000145494");
		expect(rows[5]?.cells.item).toBe("TOTAL(1)");
		expect(rows[5]?.cells.amount).toBe("102,600");
	});

	it("builds open invoice rows grouped by customer in detail mode", () => {
		const rows = buildOpenInvoiceRows(invoices, [], true);
		// Customer A: Header, Detail 1, Detail 2, Subtotal -> 4 rows
		// Customer B: Header, Detail 1, Subtotal -> 3 rows
		expect(rows).toHaveLength(7);
		expect(rows[0]?.cells.customer).toBe("Customer A");
		expect(rows[1]?.cells.refNo).toBe("IN000145530");
		expect(rows[2]?.cells.refNo).toBe("IN000145531");
		expect(rows[3]?.cells.employee).toBe("Total(2)");
		expect(rows[3]?.cells.originalAmount).toBe("430,600");
		expect(rows[4]?.cells.customer).toBe("Customer B");
		expect(rows[5]?.cells.refNo).toBe("CS000145494");
		expect(rows[6]?.cells.employee).toBe("Total(1)");
		expect(rows[6]?.cells.originalAmount).toBe("102,600");
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
		expect(rows[1]?.cells.refNo).toBe("REC000001");
		expect(rows[1]?.cells.received).toBe("100,000");
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
		const rows = buildCustomerTransactionDetailByTypeRows(invoices, previewRows);

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
		// Receipt section includes Customer A (paid 100000)
		const receiptRows = rows.slice(rows.findIndex((r) => r.cells.date === "Receipt"));
		expect(receiptRows.some((r) => r.cells.date === "Customer A")).toBe(true);
		// Receipt section DOES NOT include Customer B (paid 0)
		expect(receiptRows.some((r) => r.cells.date === "Customer B")).toBe(false);
	});
});
