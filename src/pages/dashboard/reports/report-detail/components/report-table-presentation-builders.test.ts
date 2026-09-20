import type { Customer } from "@/core/types/customer";
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

describe("open invoice group header", () => {
	it("shows a single customer meta line when a customer is selected, not the 3-column grid", () => {
		const customer: Customer = {
			id: "c004",
			registerDate: "2026-01-01",
			code: "C004",
			name: "សម្រេច (2G-8421)",
			status: true,
			defaultPrice: "",
			warehouseId: "",
			memo: "",
			profileUrl: "",
			shopBannerUrl: "",
			employeeId: "",
			telephone: "",
			email: "",
			geography: "",
			address: "",
			location: "",
			map: "",
			billingAddress: "",
			deliveryAddress: "",
			vehicles: [],
		};

		const presentation = buildReportPresentation({
			templateId: "open-invoice-on-period-by-group",
			reportSlug: "open-invoice-on-period-by-group",
			title: "Open Invoice On Period By Group",
			filters: undefined,
			selectedCustomerLabel: "C004 : សម្រេច (2G-8421)",
			selectedCustomer: customer,
			rows: [],
			previewRows: [],
		});

		expect(presentation.metaColumns).toHaveLength(1);
		expect(presentation.metaColumns?.[0]?.rows).toEqual(["អតិថិជន: [C004 : សម្រេច (2G-8421)]"]);
	});

	it("falls back to the 3-column grid when Customer = All", () => {
		const presentation = buildReportPresentation({
			templateId: "open-invoice-on-period-by-group",
			reportSlug: "open-invoice-on-period-by-group",
			title: "Open Invoice On Period By Group",
			filters: undefined,
			selectedCustomerLabel: undefined,
			selectedCustomer: undefined,
			rows: [],
			previewRows: [],
		});

		expect(presentation.metaColumns).toHaveLength(3);
	});

	it("omits the empty code prefix when the selected customer has no code", () => {
		const customerWithoutCode: Customer = {
			id: "c-nocode",
			registerDate: "2026-01-01",
			code: "",
			name: "No Code Customer",
			status: true,
			defaultPrice: "",
			warehouseId: "",
			memo: "",
			profileUrl: "",
			shopBannerUrl: "",
			employeeId: "",
			telephone: "",
			email: "",
			geography: "",
			address: "",
			location: "",
			map: "",
			billingAddress: "",
			deliveryAddress: "",
			vehicles: [],
		};

		const presentation = buildReportPresentation({
			templateId: "open-invoice-on-period-by-group",
			reportSlug: "open-invoice-on-period-by-group",
			title: "Open Invoice On Period By Group",
			filters: undefined,
			selectedCustomerLabel: "No Code Customer",
			selectedCustomer: customerWithoutCode,
			rows: [],
			previewRows: [],
		});

		expect(presentation.metaColumns?.[0]?.rows).toEqual(["អតិថិជន: [No Code Customer]"]);
	});

	it("falls back to the 3-column grid when the selected customer id no longer resolves (deleted customer)", () => {
		// useReportTableData's selectedCustomerInfo falls back to the raw filter id as the label
		// when the customer record can't be found in the current customer list — selectedCustomer
		// stays undefined in that case. Meta columns must not crash or fabricate a customer line.
		const presentation = buildReportPresentation({
			templateId: "open-invoice-on-period-by-group",
			reportSlug: "open-invoice-on-period-by-group",
			title: "Open Invoice On Period By Group",
			filters: undefined,
			selectedCustomerLabel: "deleted-customer-id",
			selectedCustomer: undefined,
			rows: [],
			previewRows: [],
		});

		expect(presentation.metaColumns).toHaveLength(3);
		expect(presentation.metaColumns?.[0]?.rows).toEqual(["Branch: ['01 : ភ្នំពេញ']", "Customer: [deleted-customer-id]"]);
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
