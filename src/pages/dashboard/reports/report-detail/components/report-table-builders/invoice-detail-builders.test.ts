import type { Invoice, InvoiceExportLineApi } from "@/core/types/invoice";
import { buildSaleDetailRows } from "./invoice-detail-builders";

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
});
