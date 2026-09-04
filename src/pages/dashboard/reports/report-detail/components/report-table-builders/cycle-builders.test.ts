import { describe, expect, it } from "vitest";
import type { OpenInvoiceCustomerGroup, OpenInvoiceCycleGroup } from "@/core/types/report";
import { buildCycleReportRows } from "./cycle-builders";

describe("cycle-builders", () => {
	it("builds cycle report rows with a Total row at the bottom", () => {
		const groups: OpenInvoiceCustomerGroup[] = [
			{
				customerName: "Customer A",
				cycles: [
					{
						cycleStartDate: "2026-08-01",
						cycleEndDate: "2026-08-15",
						totalOriginalAmount: 500000,
						totalPaidAmount: 300000,
						balance: 200000,
						invoices: [],
					} satisfies OpenInvoiceCycleGroup,
				],
			},
			{
				customerName: "Customer B",
				cycles: [
					{
						cycleStartDate: "2026-08-05",
						cycleEndDate: "2026-08-20",
						totalOriginalAmount: 200000,
						totalPaidAmount: 200000,
						balance: 0,
						invoices: [],
					} satisfies OpenInvoiceCycleGroup,
				],
			},
		];

		const rows = buildCycleReportRows(groups);

		// 2 customers × (1 header + 1 cycle + 1 subtotal) + 1 grand total = 7
		expect(rows).toHaveLength(7);

		// Row 0: Customer A header
		expect(rows[0]?.isStructural).toBe(true);
		expect(rows[0]?.cells.customer).toBe("Customer A");
		expect(rows[0]?.key).toContain("cycle-customer-header");

		// Row 1: Cycle A detail
		expect(rows[1]?.cells.cycle).toBe("01/08/2026 - 15/08/2026");
		expect(rows[1]?.cells.invoiceTotal).toBe("500,000");
		expect(rows[1]?.cells.paid).toBe("300,000");
		expect(rows[1]?.cells.outstanding).toBe("200,000");

		// Row 2: Customer A subtotal
		expect(rows[2]?.isStructural).toBe(true);
		expect(rows[2]?.cells.cycle).toBe("Total(1)");
		expect(rows[2]?.cells.invoiceTotal).toBe("500,000");
		expect(rows[2]?.cells.paid).toBe("300,000");
		expect(rows[2]?.cells.outstanding).toBe("200,000");

		// Row 3: Customer B header
		expect(rows[3]?.isStructural).toBe(true);
		expect(rows[3]?.cells.customer).toBe("Customer B");

		// Row 4: Cycle B detail
		expect(rows[4]?.cells.cycle).toBe("05/08/2026 - 20/08/2026");
		expect(rows[4]?.cells.invoiceTotal).toBe("200,000");
		expect(rows[4]?.cells.paid).toBe("200,000");
		expect(rows[4]?.cells.outstanding).toBe("0");

		// Row 5: Customer B subtotal
		expect(rows[5]?.isStructural).toBe(true);
		expect(rows[5]?.cells.cycle).toBe("Total(1)");

		// Row 6: Grand Total
		const totalRow = rows[6];
		expect(totalRow?.key).toBe("cycle-grand-total");
		expect(totalRow?.cells.customer).toBe("TOTAL");
		expect(totalRow?.cells.invoiceTotal).toBe("700,000");
		expect(totalRow?.cells.paid).toBe("500,000");
		expect(totalRow?.cells.outstanding).toBe("200,000");
	});

	it("returns empty array when groups are empty", () => {
		const rows = buildCycleReportRows([]);
		expect(rows).toEqual([]);
	});
});
