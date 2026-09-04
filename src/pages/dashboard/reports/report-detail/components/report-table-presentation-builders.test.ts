import type { Invoice, InvoiceExportLineApi } from "@/core/types/invoice";
import type { InventoryStockReportLine } from "@/core/types/report";
import {
	buildInventoryStockReportRows,
	filterInventoryStockReportRowsByDate,
} from "./report-table-builders/inventory-builders";
import { buildSaleDetailRows } from "./report-table-builders/invoice-detail-builders";
import { buildReportPresentation } from "./report-table-presentation-builders";

const invoices: Invoice[] = [
	{ id: "1", refNo: "IN1", customerName: "Customer A", amount: 100, date: "2026-06-09", type: "invoice" },
	{ id: "2", refNo: "IN2", customerName: "Customer B", amount: 200, date: "2026-06-09", type: "invoice" },
];

const exportLines: InvoiceExportLineApi[] = [
	{ refNo: "IN1", customerName: "Customer A", date: "2026-06-09", productName: "P", quantity: 10, amount: 100 },
	{ refNo: "IN2", customerName: "Customer B", date: "2026-06-09", productName: "P", quantity: 20, amount: 200 },
];

describe("sale detail summary", () => {
	it("counts each detail row once, excluding the per-customer TOTAL rows", () => {
		const rows = buildSaleDetailRows(invoices, exportLines);

		const presentation = buildReportPresentation({
			templateId: "sale-detail-by-customer",
			reportSlug: "sale-detail-by-customer",
			title: "Sale Detail By Customer",
			filters: undefined,
			selectedCustomerLabel: undefined,
			selectedCustomer: undefined,
			rows,
			previewRows: [],
		});

		const summary = Object.fromEntries((presentation.summaryRows ?? []).map((row) => [row.key, row.value]));

		// 2 detail rows: qty 10 + 20, amount 100 + 200. The TOTAL rows must not be added again.
		expect(summary["sale-detail-total-qty"]).toBe("30");
		expect(summary["sale-detail-total-amount"]).toBe("300");
		expect(summary["sale-detail-cash-invoice"]).toBe("2");
		expect(summary["sale-detail-total-customer"]).toBe("2");
	});
});

describe("inventory stock summary", () => {
	it("counts carried-forward stock exactly once in the total", () => {
		const lines: InventoryStockReportLine[] = [
			{ itemCode: "ICE-001", itemName: "Ice Box", quantity: 5, type: "IN", createdAt: "2025-04-01T08:00:00" },
			{ itemCode: "DRY-001", itemName: "Dryer Machine", quantity: 7, type: "IN", createdAt: "2025-05-01T08:00:00" },
		];
		const rows = filterInventoryStockReportRowsByDate(buildInventoryStockReportRows(lines), "2025-04-01", "2025-04-30");

		const presentation = buildReportPresentation({
			templateId: "ice-bag-inventory-stock-report",
			reportSlug: "inventory-valuation-summary",
			title: "Inventory Stock Report",
			filters: undefined,
			selectedCustomerLabel: undefined,
			selectedCustomer: undefined,
			rows,
			previewRows: [],
		});

		// The opening-balance row keeps its item keys, so it still contributes its 7 to the total.
		expect(presentation.summaryRows?.[0]?.value).toBe("12");
	});
});
