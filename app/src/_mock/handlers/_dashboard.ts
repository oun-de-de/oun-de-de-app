import { faker } from "@faker-js/faker";
import { http, HttpResponse } from "msw";
import { ResultStatus } from "@/types/enum";
import { format } from "date-fns";
import { DailyIncomePoint } from "@/pages/dashboard/_dashboard/domain/entities/daily-income-point";
import { CustomerSummaryItem } from "@/pages/dashboard/_dashboard/domain/entities/customer-info";
import { PerformanceItem } from "@/pages/dashboard/_dashboard/domain/entities/performance";
import { FilterData } from "@/pages/dashboard/_dashboard/domain/entities/filter";


/**
 * Generate mock daily income POS data using faker
 * @param days - Number of days to generate data for
 * @returns Array of DailyIncomePoint
 */
function generateDailyIncomePosData(days: number): DailyIncomePoint[] {
  const data: DailyIncomePoint[] = [];
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

const dailyIncomePos = http.get("/api/dashboard/daily-income-pos", ({ request }) => {
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

const customerInfo = http.get("/api/dashboard/customer-info", () => {
  const mock: CustomerSummaryItem[] = [
    { id: "deposit", label: "Deposit Balance", value: "0 ₺", variant: "info", icon: "solar:dollar-bold" },
    { id: "sale-order", label: "Sale Order", value: "0 ₺", variant: "success", icon: "solar:users-group-rounded-bold" },
    { id: "invoice", label: "Invoice", value: "398,631,700 ₺", variant: "warning", icon: "solar:bill-list-bold" },
    { id: "overdue", label: "Overdue", value: "0 ₺", variant: "destructive", icon: "solar:bill-cross-bold" },
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

const performance = http.get("/api/dashboard/performance", () => {
  const mock: PerformanceItem[] = [
    {
      id: "income",
      label: "Income",
      value: "255,180,200 ₺",
      variant: "info",
    },
    {
      id: "expenses",
      label: "Expenses",
      value: "39,366,200 ₺",
      variant: "warning",
    },
    {
      id: "net-income",
      label: "Net Income",
      value: "215,814,000 ₺",
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

const dashboardFilters = http.get("/api/dashboard/filters", () => {
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

export { dailyIncomePos, customerInfo, performance, dashboardFilters };

