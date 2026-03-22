import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { HttpResponse, http } from "msw";
import type { DailyIncomeAccounting, DailyIncomePos } from "@/core/domain/dashboard/entities/daily-income";
import { ResultStatus } from "@/core/types/enum";
import type { DailyReportResponse, InventoryStockReportLine } from "@/core/types/report";

/**
 * Generate mock daily income POS data using faker
 * @param days - Number of days to generate data for
 * @returns Array of DailyIncomePoint
 */
function generateDailyIncomePosData(days: number): DailyIncomePos[] {
	const data: DailyIncomePos[] = [];
	const today = new Date();

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		// Generate random amount between 2,000,000 and 30,000,000
		const amount = faker.number.int({
			min: 2_000_000,
			max: 30_000_000,
		});

		data.push({
			date: format(date, "dd/MM/yyyy"),
			amount,
		});
	}

	return data;
}

function generateDailyIncomeAccountingData(days: number): DailyIncomeAccounting[] {
	const data: DailyIncomeAccounting[] = [];
	const today = new Date();

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		const income = faker.number.int({
			min: 5_000_000,
			max: 25_000_000,
		});

		const expense = faker.number.int({
			min: 1_000_000,
			max: 15_000_000,
		});

		data.push({
			date: format(date, "dd/MM/yyyy"),
			income,
			expense,
		});
	}

	return data;
}

function generateReportDailyReportData(date: string): DailyReportResponse {
	const dateSeed = new Date(date).getDate() || 1;
	const soldProducts = Array.from({ length: 4 }, (_, index) => {
		const totalQuantity = faker.number.int({ min: 20 + dateSeed, max: 250 + dateSeed });
		const totalAmount = totalQuantity * faker.number.int({ min: 1_000, max: 4_000 });
		const productNameByIndex = [
			"Ice cube sale cash",
			"Premium Ice sale cash",
			"customer sale invoice Premium Ice",
			"Customer sale invoice ice cube",
		];

		return {
			productName: productNameByIndex[index] ?? `Ice Product ${index + 1}`,
			unit: "bag",
			totalQuantity,
			totalAmount,
		};
	});

	const expenseNames = ["Fuel", "Salary Advance", "Equipment Repair", "Ice Bag Purchase"];
	const boughtItems = expenseNames.map((itemName, index) => ({
		itemName,
		expense: faker.number.int({ min: 100_000 + index * 20_000, max: 800_000 + dateSeed * 5_000 }),
	}));

	const totalRevenue = soldProducts.reduce((sum, item) => sum + (item.totalAmount ?? 0), 0);
	const totalExpense = boughtItems.reduce((sum, item) => sum + (item.expense ?? 0), 0);

	return {
		soldProducts,
		boughtItems,
		totalRevenue,
		totalCashReceive: Math.max(totalRevenue - faker.number.int({ min: 0, max: 300_000 }), 0),
		totalExpense,
	};
}

function generateInventoryStockReportData(fromDate: string, toDate: string): InventoryStockReportLine[] {
	const dates = [fromDate, toDate].filter(Boolean);
	const [firstDate, secondDate] = dates.length > 1 ? dates : [fromDate, fromDate];

	return [
		{
			itemCode: "ICE-BAG-001",
			itemName: "Ice Bag Small",
			quantity: 120,
			type: "IN",
			reason: "PURCHASE",
			createdAt: `${firstDate}T08:00:00`,
		},
		{
			itemCode: "ICE-BAG-001",
			itemName: "Ice Bag Small",
			quantity: 30,
			type: "OUT",
			reason: "CONSUME",
			createdAt: `${firstDate}T15:00:00`,
		},
		{
			itemCode: "ICE-BAG-002",
			itemName: "Ice Bag Large",
			quantity: 90,
			type: "IN",
			reason: "PURCHASE",
			createdAt: `${secondDate}T09:00:00`,
		},
		{
			itemCode: "ICE-BAG-002",
			itemName: "Ice Bag Large",
			quantity: 20,
			type: "OUT",
			reason: "BORROW",
			createdAt: `${secondDate}T14:00:00`,
		},
		{
			itemCode: "ICE-BAG-001",
			itemName: "Ice Bag Small",
			quantity: 25,
			type: "IN",
			reason: "RETURN",
			createdAt: `${secondDate}T16:00:00`,
		},
		{
			itemCode: "ICE-BAG-003",
			itemName: "Premium Ice Sleeve",
			quantity: 60,
			type: "IN",
			reason: "PURCHASE",
			createdAt: `${firstDate}T10:30:00`,
		},
		{
			itemCode: "ICE-BAG-003",
			itemName: "Premium Ice Sleeve",
			quantity: 18,
			type: "OUT",
			reason: "CONSUME",
			createdAt: `${secondDate}T11:15:00`,
		},
		{
			itemCode: "ICE-BAG-004",
			itemName: "Crystal Ice Wrapper",
			quantity: 45,
			type: "IN",
			reason: "PURCHASE",
			createdAt: `${secondDate}T07:45:00`,
		},
		{
			itemCode: "ICE-BAG-004",
			itemName: "Crystal Ice Wrapper",
			quantity: 12,
			type: "OUT",
			reason: "BORROW",
			createdAt: `${secondDate}T17:20:00`,
		},
	];
}

const dailyIncomePos = http.get("/api/v1/dashboard/daily-income-pos", ({ request }) => {
	const url = new URL(request.url);
	const range = url.searchParams.get("range") ?? "30";

	let days: number;
	switch (range) {
		case "7": // Last 7 days
			days = 7;
			break;
		case "15": // Last 15 days
			days = 15;
			break;
		case "30": // Last 30 days
			days = 30;
			break;
		default:
			days = 30;
			break;
	}

	const data = generateDailyIncomePosData(days);

	return HttpResponse.json(
		{
			message: "",
			data,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const dailyIncomeAccounting = http.get("/api/v1/dashboard/daily-income-accounting", ({ request }) => {
	const url = new URL(request.url);
	const range = url.searchParams.get("range") ?? "30";

	let days: number;
	switch (range) {
		case "7": // Last 7 days
			days = 7;
			break;
		case "15": // Last 15 days
			days = 15;
			break;
		case "30": // Last 30 days
			days = 30;
			break;
		default:
			days = 30;
			break;
	}

	const data = generateDailyIncomeAccountingData(days);

	return HttpResponse.json(
		{
			message: "",
			data,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const financialOverview = http.get("/api/v1/dashboard/financial-overview", () => {
	const mock = {
		invoiceAmount: faker.number.int({ min: 100_000, max: 500_000_000 }),
		overdueCycles: faker.number.int({ min: 0, max: 20 }),
		dueLoanInstallments: faker.number.int({ min: 0, max: 50 }),
		depositBalance: faker.number.int({ min: 0, max: 100_000_000 }),
	};

	return HttpResponse.json(
		{
			message: "",
			data: mock,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const performance = http.get("/api/v1/dashboard/performance", () => {
	const mock = {
		income: faker.number.int({ min: 50_000_000, max: 300_000_000 }),
		expenses: faker.number.int({ min: 10_000_000, max: 100_000_000 }),
	};

	return HttpResponse.json(
		{
			message: "",
			data: mock,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const dailyReport = http.get("/api/v1/dashboard/daily-report", ({ request }) => {
	const url = new URL(request.url);
	const range = url.searchParams.get("range") ?? "30";

	let days: number;
	switch (range) {
		case "7":
			days = 7;
			break;
		case "15":
			days = 15;
			break;
		case "30":
			days = 30;
			break;
		default:
			days = 30;
			break;
	}

	const data = generateDailyIncomeAccountingData(days);

	return HttpResponse.json(
		{
			message: "",
			data,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const reportDailyReport = http.get("/api/v1/reports/daily-report", ({ request }) => {
	const url = new URL(request.url);
	const date = url.searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");
	const data = generateReportDailyReportData(date);

	return HttpResponse.json(
		{
			message: "",
			data,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const inventoryStockReport = http.get("/api/v1/reports/inventory-stock-report", ({ request }) => {
	const url = new URL(request.url);
	const fromDate = url.searchParams.get("fromDate") ?? format(new Date(), "yyyy-MM-dd");
	const toDate = url.searchParams.get("toDate") ?? fromDate;
	const data = generateInventoryStockReportData(fromDate, toDate);

	return HttpResponse.json(
		{
			message: "",
			data,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

export {
	dailyIncomeAccounting,
	dailyIncomePos,
	dailyReport,
	financialOverview,
	inventoryStockReport,
	performance,
	reportDailyReport,
};
