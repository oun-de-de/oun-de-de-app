import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { HttpResponse, http } from "msw";
import type { CustomerSummaryItem } from "@/core/domain/dashboard/entities/customer-info";
import type { DailyIncomeAccounting, DailyIncomePos } from "@/core/domain/dashboard/entities/daily-income";
import type { FilterData } from "@/core/domain/dashboard/entities/filter";
import type { PerformanceItem } from "@/core/domain/dashboard/entities/performance";
import { ResultStatus } from "@/core/types/enum";

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

const customerInfo = http.get("/api/v1/dashboard/customer-info", () => {
	const mock: CustomerSummaryItem[] = [
		{ id: "deposit", label: "Deposit Balance", value: "0 KHR", variant: "info", icon: "solar:dollar-bold" },
		{
			id: "sale-order",
			label: "Sale Order",
			value: "0 KHR",
			variant: "success",
			icon: "solar:users-group-rounded-bold",
		},
		{ id: "invoice", label: "Invoice", value: "398,631,700 KHR", variant: "warning", icon: "solar:bill-list-bold" },
		{ id: "overdue", label: "Overdue", value: "0 KHR", variant: "destructive", icon: "solar:bill-cross-bold" },
	];

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
	const mock: PerformanceItem[] = [
		{
			id: "income",
			label: "Income",
			value: "255,180,200 KHR",
			variant: "info",
		},
		{
			id: "expenses",
			label: "Expenses",
			value: "39,366,200 KHR",
			variant: "warning",
		},
		{
			id: "net-income",
			label: "Net Income",
			value: "215,814,000 KHR",
			variant: "success",
		},
	];

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

const dashboardFilters = http.get("/api/v1/dashboard/filters", () => {
	const mock: FilterData[] = [
		{ id: "7", value: "Last 7 Days" },
		{ id: "15", value: "Last 15 Days" },
		{ id: "30", value: "Last 30 Days" },
	];

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

export { dailyIncomeAccounting, dailyIncomePos, customerInfo, performance, dashboardFilters };
