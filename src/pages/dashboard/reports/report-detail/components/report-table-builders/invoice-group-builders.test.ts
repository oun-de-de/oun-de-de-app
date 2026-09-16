import type { ReactElement } from "react";
import { describe, expect, it } from "vitest";
import type { Invoice, InvoiceExportPreviewRow, PaymentResult } from "@/core/types/invoice";
import { buildOpenInvoiceGroupRows } from "./invoice-detail-builders";

// open-invoice refNo cells render a <Link to="...">refNo</Link> instead of a plain string.
function refNoText(cell: unknown): string {
	if (typeof cell === "string") return cell;
	return String((cell as ReactElement<{ children: string }>).props.children);
}

function row(overrides: Partial<InvoiceExportPreviewRow>): InvoiceExportPreviewRow {
	return {
		refNo: "IN001",
		cycleId: null,
		customerName: "Customer A",
		referredByName: null,
		date: "2026-09-01",
		productName: "Ice Cube",
		unit: "bag",
		pricePerProduct: 1000,
		quantityPerProduct: 1,
		quantity: 10,
		amount: 10000,
		total: 10000,
		memo: null,
		paid: null,
		balance: null,
		...overrides,
	};
}

// The export-preview link needs the real invoice id, resolved by refNo — build the
// matching Invoice[] alongside each preview row.
function invoicesFor(rows: InvoiceExportPreviewRow[]): Invoice[] {
	return rows.map((r) => ({
		id: `id-${r.refNo}`,
		refNo: r.refNo,
		customerName: r.customerName,
		date: r.date,
	}));
}

describe("buildOpenInvoiceGroupRows", () => {
	it("1 cycle / 1 line / no payment: full balance, empty paid", () => {
		const rows = [row({ cycleId: "C1", amount: 10000 })];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, []);
		const detail = result.find((r) => !r.isStructural);
		expect(detail?.cells.paid).toBe("");
		expect(detail?.cells.balance).toBe("10,000");
	});

	it("1 cycle / 1 line / partial payment: balance reduced, paid shown", () => {
		const rows = [row({ cycleId: "C1", amount: 10000 })];
		const payments: PaymentResult[] = [{ cycleId: "C1", amount: 4000 }];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, payments);
		const detail = result.find((r) => !r.isStructural);
		expect(detail?.cells.paid).toBe("4,000");
		expect(detail?.cells.balance).toBe("6,000");
	});

	it("1 cycle / multiple lines / payment: paid shown only on first line by date", () => {
		const rows = [
			row({ cycleId: "C1", refNo: "IN001", date: "2026-09-01", amount: 10000 }),
			row({ cycleId: "C1", refNo: "IN002", date: "2026-09-02", amount: 20000 }),
		];
		const payments: PaymentResult[] = [{ cycleId: "C1", amount: 5000 }];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, payments);
		const details = result.filter((r) => !r.isStructural);
		expect(refNoText(details[0]?.cells.refNo)).toBe("IN001");
		expect(details[0]?.cells.paid).toBe("5,000");
		expect(details[0]?.cells.balance).toBe("5,000");
		expect(details[1]?.cells.paid).toBe("");
		expect(details[1]?.cells.balance).toBe("20,000");
	});

	it("multiple cycles: each cycle gets its own paid allocation", () => {
		const rows = [
			row({ cycleId: "C1", refNo: "IN001", date: "2026-09-01", amount: 10000 }),
			row({ cycleId: "C2", refNo: "IN002", date: "2026-09-02", amount: 10000 }),
		];
		const payments: PaymentResult[] = [
			{ cycleId: "C1", amount: 3000 },
			{ cycleId: "C2", amount: 7000 },
		];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, payments);
		const details = result.filter((r) => !r.isStructural);
		expect(details[0]?.cells.paid).toBe("3,000");
		expect(details[1]?.cells.paid).toBe("7,000");
	});

	it("multiple payment records same cycle: aggregates before allocating", () => {
		const rows = [row({ cycleId: "C1", amount: 10000 })];
		const payments: PaymentResult[] = [
			{ cycleId: "C1", amount: 2000 },
			{ cycleId: "C1", amount: 3000 },
		];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, payments);
		const detail = result.find((r) => !r.isStructural);
		expect(detail?.cells.paid).toBe("5,000");
		expect(detail?.cells.balance).toBe("5,000");
	});

	it("skips fully paid lines (balance <= 0)", () => {
		const rows = [row({ cycleId: "C1", amount: 10000 })];
		const payments: PaymentResult[] = [{ cycleId: "C1", amount: 10000 }];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, payments);
		expect(result.filter((r) => !r.isStructural)).toHaveLength(0);
	});

	it("payment exceeding line amount: balance floors at 0, no negative", () => {
		const rows = [
			row({ cycleId: "C1", refNo: "IN001", date: "2026-09-01", amount: 10000 }),
			// Second line keeps a positive balance so we can still see row 1 clamp to zero and drop.
			row({ cycleId: "C2", refNo: "IN002", date: "2026-09-02", amount: 5000 }),
		];
		const payments: PaymentResult[] = [{ cycleId: "C1", amount: 99000 }];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, payments);
		const details = result.filter((r) => !r.isStructural);
		// IN001's balance clamps to 0 and is dropped by the open-invoice filter.
		expect(details).toHaveLength(1);
		expect(refNoText(details[0]?.cells.refNo)).toBe("IN002");
		expect(details[0]?.cells.balance).toBe("5,000");
	});

	it("customer = specific: no customer header/subtotal rows", () => {
		const rows = [row({ cycleId: "C1", amount: 10000 })];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, [], false);
		expect(result.some((r) => String(r.key).includes("customer-header"))).toBe(false);
	});

	it("customer = All: groups rows under a customer header per customer", () => {
		const rows = [
			row({ cycleId: "C1", customerName: "Customer A", refNo: "IN001", amount: 10000 }),
			row({ cycleId: "C2", customerName: "Customer B", refNo: "IN002", amount: 10000 }),
		];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, [], true);
		const headers = result.filter((r) => String(r.key).includes("customer-header"));
		expect(headers).toHaveLength(2);
		expect(headers[0]?.cells.item).toBe("Customer A");
		expect(headers[1]?.cells.item).toBe("Customer B");
	});

	it("resolves the export-preview link to the invoice id, not the refNo", () => {
		const rows = [row({ cycleId: "C1", refNo: "IN001", amount: 10000 })];
		const result = buildOpenInvoiceGroupRows(invoicesFor(rows), rows, []);
		const detail = result.find((r) => !r.isStructural);
		const refNoCell = detail?.cells.refNo as ReactElement<{ to: string }>;
		expect(refNoCell.props.to).toBe("/dashboard/invoice/export-preview?ids=id-IN001");
	});
});
