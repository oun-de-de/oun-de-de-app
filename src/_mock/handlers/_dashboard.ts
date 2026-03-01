import { faker } from "@faker-js/faker";
import { format } from "date-fns";
import { HttpResponse, http } from "msw";
import type { DailyIncomeAccounting, DailyIncomePos } from "@/core/domain/dashboard/entities/daily-income";
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

const financialOverview = http.get("/api/v1/dashboard/financial-overview", () => {
	const mock = {
		invoiceAmount: faker.number.int({ min: 100_000, max: 500_000_000 }),
		overdueCycles: faker.number.int({ min: 0, max: 20 }),
		overdueLoanInstallments: faker.number.int({ min: 0, max: 50 }),
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

export { dailyIncomeAccounting, dailyIncomePos, dailyReport, financialOverview, performance };
