import type { Cycle } from "@/core/types/cycle";
import type { Invoice, InvoiceExportLineApi, InvoiceExportPreviewRow } from "@/core/types/invoice";
import type { ReportTemplateRow } from "../../components/layout/report-template-table";
import { buildCashTransactionReportRows } from "./report-table-builders/accounting-builders";
import { buildCycleReportRows } from "./report-table-builders/cycle-builders";
import {
	buildCustomerTransactionDetailByTypeRows,
	buildOpenInvoiceRows,
	buildReceiptDetailRows,
	buildSaleDetailRows,
} from "./report-table-builders/invoice-detail-builders";
import { sortReportRows } from "./report-table-utils";

function dataRow(key: string, date: string, balance: string): ReportTemplateRow {
	return { key, cells: { date, balance, customer: key } };
}

function structuralRow(key: string): ReportTemplateRow {
	return { key, cells: { date: "", balance: "", customer: key }, isStructural: true };
}

// Customer A holds two invoices in ascending date order, Customer B one, plus a grand total.
const groupedRows: ReportTemplateRow[] = [
	structuralRow("header-a"),
	dataRow("a-1", "09/06/2026", "100"),
	dataRow("a-2", "11/06/2026", "300"),
	structuralRow("subtotal-a"),
	structuralRow("header-b"),
	dataRow("b-1", "10/06/2026", "200"),
	structuralRow("subtotal-b"),
	structuralRow("grand-total"),
];

describe("sortReportRows", () => {
	it("returns rows untouched in default mode", () => {
		expect(sortReportRows(groupedRows, "default")).toBe(groupedRows);
	});

	it("keeps structural rows in place and reorders only within each group", () => {
		const sorted = sortReportRows(groupedRows, "date-desc");

		expect(sorted.map((row) => row.key)).toEqual([
			"header-a",
			"a-2", // 11/06 now leads its own group…
			"a-1",
			"subtotal-a",
			"header-b",
			"b-1", // …and never crosses into Customer B's group, despite being the later date overall.
			"subtotal-b",
			"grand-total",
		]);
	});

	it("does not let a high-value detail row escape its group under balance-desc", () => {
		const sorted = sortReportRows(groupedRows, "balance-desc");
		const keys = sorted.map((row) => row.key);

		expect(keys.indexOf("a-2")).toBeLessThan(keys.indexOf("subtotal-a"));
		expect(keys.indexOf("b-1")).toBeGreaterThan(keys.indexOf("header-b"));
		expect(keys[keys.length - 1]).toBe("grand-total");
	});

	it("sorts a flat report as one run", () => {
		const flatRows = [dataRow("r1", "09/06/2026", "100"), dataRow("r2", "11/06/2026", "300")];

		expect(sortReportRows(flatRows, "date-desc").map((row) => row.key)).toEqual(["r2", "r1"]);
	});
});

// isStructural is set by hand at ~20 build sites, so a grouped builder can silently miss one and
// start letting its subtotals drift under sort. These run the real builders and check the output.
describe("grouped builders mark their structural rows", () => {
	const invoices: Invoice[] = [
		{ id: "1", refNo: "IN1", customerName: "Alice", amount: 100, date: "2026-06-09", type: "invoice" },
		{ id: "2", refNo: "IN2", customerName: "Bob", amount: 200, date: "2026-06-10", type: "invoice" },
	];
	const previews: InvoiceExportPreviewRow[] = [
		{ refNo: "IN1", quantity: 5, amount: 100, paid: 40, balance: 60 } as InvoiceExportPreviewRow,
		{ refNo: "IN2", quantity: 8, amount: 200, paid: 0, balance: 200 } as InvoiceExportPreviewRow,
	];
	const receipts: Invoice[] = [
		{ id: "r1", refNo: "REC1", customerName: "Alice", amount: 40, date: "2026-06-11", type: "receipt" },
	];
	const exportLines: InvoiceExportLineApi[] = [
		{ refNo: "IN1", customerName: "Alice", date: "2026-06-09", productName: "P", quantity: 5, amount: 100 },
	];
	const cycles: Cycle[] = [
		{
			id: "c1",
			customerId: "cust-1",
			customerName: "Alice",
			startDate: "2026-06-01",
			endDate: "2026-06-15",
			status: "OPEN",
			totalAmount: 500,
			totalPaidAmount: 300,
		},
	];

	// A row is structural if its key names a group header, subtotal, grand total, or section banner.
	// Group headers are not uniformly named: some say "header", others are just the customer key
	// (`customer-group-0-Alice`, `tx-inv-cust-0-Alice`) whose detail rows use a different prefix.
	const STRUCTURAL_KEY =
		/header|subtotal|grand-total|^customer-group-[^-]+-[^-]+$|^customer-group-.*-total$|^tx-(inv|rcp)-cust-\d+-/;

	it.each([
		["open invoice", () => buildOpenInvoiceRows(invoices, previews, true)],
		["receipt detail", () => buildReceiptDetailRows(receipts, [], true)],
		["sale detail", () => buildSaleDetailRows(invoices, exportLines)],
		["customer transaction by type", () => buildCustomerTransactionDetailByTypeRows(invoices, previews)],
		["cycle summary", () => buildCycleReportRows(cycles)],
		[
			"cash transaction",
			() => buildCashTransactionReportRows({ lines: [{ date: "2026-06-09", refNo: "R1", debit: 10, credit: 0 }] }),
		],
	])("%s", (_name, build) => {
		const rows = build();
		expect(rows.length).toBeGreaterThan(0);

		const unmarked = rows.filter((row) => STRUCTURAL_KEY.test(row.key) && !row.isStructural).map((row) => row.key);
		expect(unmarked).toEqual([]);

		// And the flag must not leak onto ordinary data rows, which would freeze them under sort.
		const overMarked = rows.filter((row) => row.isStructural && !STRUCTURAL_KEY.test(row.key)).map((row) => row.key);
		expect(overMarked).toEqual([]);
	});
});
