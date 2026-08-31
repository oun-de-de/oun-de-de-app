import { describe, expect, it } from "vitest";
import type { Cycle } from "@/core/types/cycle";
import { buildCycleReportRows } from "./cycle-builders";

describe("cycle-builders", () => {
	it("builds cycle report rows with a Total row at the bottom", () => {
		const cycles: Cycle[] = [
			{
				id: "cycle-1",
				customerId: "cust-1",
				customerName: "Customer A",
				startDate: "2026-08-01",
				endDate: "2026-08-15",
				totalAmount: 500000,
				totalPaidAmount: 300000,
				status: "OPEN",
			},
			{
				id: "cycle-2",
				customerId: "cust-2",
				customerName: "Customer B",
				startDate: "2026-08-05",
				endDate: "2026-08-20",
				totalAmount: 200000,
				totalPaidAmount: 200000,
				status: "OPEN",
			},
		];

		const rows = buildCycleReportRows(cycles);

		expect(rows).toHaveLength(3);
		expect(rows[0]?.cells.customer).toBe("Customer A");
		expect(rows[0]?.cells.invoiceTotal).toBe("500,000");
		expect(rows[0]?.cells.paid).toBe("300,000");
		expect(rows[0]?.cells.outstanding).toBe("200,000");

		expect(rows[1]?.cells.customer).toBe("Customer B");
		expect(rows[1]?.cells.invoiceTotal).toBe("200,000");
		expect(rows[1]?.cells.paid).toBe("200,000");
		expect(rows[1]?.cells.outstanding).toBe("0");

		// Grand Total row
		const totalRow = rows[2];
		expect(totalRow?.key).toBe("cycle-grand-total");
		expect(totalRow?.cells.customer).toBe("Total");
		expect(totalRow?.cells.invoiceTotal).toBe("700,000");
		expect(totalRow?.cells.paid).toBe("500,000");
		expect(totalRow?.cells.outstanding).toBe("200,000");
	});

	it("returns empty array when cycles are empty", () => {
		const rows = buildCycleReportRows([]);
		expect(rows).toEqual([]);
	});
});
