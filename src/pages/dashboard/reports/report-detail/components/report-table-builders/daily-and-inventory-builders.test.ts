import type { InventoryItem } from "@/core/types/inventory";
import type { DailyReportResponse, InventoryStockReportLine } from "@/core/types/report";
import {
	buildApiDailyReportRows,
	buildCompanyAssetRows,
	buildInventoryStockReportRows,
	filterInventoryStockReportRowsByDate,
} from "./index";

const inventoryItemFixture: InventoryItem = {
	id: "asset-1",
	code: "EQ-001",
	name: "Dryer Machine",
	type: "EQUIPMENT",
	unit: {
		id: "unit-1",
		name: "pcs",
		descr: "",
		type: "COUNT",
	},
	unitPrice: 850,
	quantityOnHand: 2,
	alertThreshold: 1,
};

describe("daily and inventory report builders", () => {
	it("builds daily report rows for sold products and expense totals", () => {
		const report: DailyReportResponse = {
			soldProducts: [
				{
					productName: " Ice Bag ",
					totalQuantity: 25,
					totalAmount: 125,
				},
				{
					productName: "",
					totalQuantity: 2,
					totalAmount: 20,
				},
			],
			boughtItems: [
				{
					itemName: "Fuel",
					expense: 30,
				},
				{
					itemName: " ",
					expense: 10,
				},
			],
			totalRevenue: 145,
			totalCashReceive: 90,
			totalExpense: 40,
		};

		const rows = buildApiDailyReportRows(report);

		expect(rows).toHaveLength(8);
		expect(rows[0]?.cells).toMatchObject({
			label: "Ice Bag",
			quantity: "25",
			amount: "125",
		});
		expect(rows[1]?.cells.label).toBe("Sold product 2");
		expect(rows[4]?.cells.label).toBe("Daily expenses");
		expect(rows[5]?.cells).toMatchObject({
			label: "Fuel",
			amount: "30",
		});
		expect(rows[6]?.cells.label).toBe("Expense item 2");
		expect(rows[7]?.cells).toMatchObject({
			label: "Total expense",
			amount: "40",
		});
	});

	it("builds company asset rows with equipment detail for printing/export", () => {
		const [row] = buildCompanyAssetRows([inventoryItemFixture]);

		expect(row.key).toBe("asset-asset-1");
		expect(row.cells.name).toBe("Dryer Machine");
		expect(row.cells.supplierName).toBe("Code EQ-001");
		expect(row.cells.detail).toBe("Unit: pcs | Code: EQ-001 | Type: EQUIPMENT");
		expect(row.cells.qty).toBe("2");
		expect(row.cells.other).toBe("Alert threshold: 1 | Unit type: COUNT");
	});

	it("keeps latest positive stock row visible when filtering outside the date range", () => {
		const lines: InventoryStockReportLine[] = [
			{
				itemCode: "ICE-001",
				itemName: "Ice Box",
				quantity: 5,
				type: "IN",
				reason: "PURCHASE",
				createdAt: "2025-04-01T08:00:00",
			},
			{
				itemCode: "ICE-001",
				itemName: "Ice Box",
				quantity: 2,
				type: "OUT",
				reason: "SOLD",
				createdAt: "2025-04-10T08:00:00",
			},
			{
				itemCode: "DRY-001",
				itemName: "Dryer Machine",
				quantity: 1,
				type: "IN",
				reason: "PURCHASE",
				createdAt: "2025-05-01T08:00:00",
			},
		];

		const rows = buildInventoryStockReportRows(lines);
		const filteredRows = filterInventoryStockReportRowsByDate(rows, "2025-04-01", "2025-04-30");

		expect(filteredRows).toHaveLength(3);
		expect(filteredRows.map((row) => row.cells.balanceName)).toEqual(["Ice Box", "Ice Box", "Dryer Machine"]);
		expect(filteredRows[2]?.cells.balanceQty).toBe("1");
	});
});
