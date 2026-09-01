import { formatDateToYYYYMMDD } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import type { ReportDefinition } from "../report-types";
import type { ReportFiltersValue } from "./report-filters";

export function normalizeCustomerText(value?: string | null) {
	return (value ?? "").trim().toLowerCase();
}

export function matchesCustomerType(
	customer: { referredBy?: string | null },
	referrer?: { id: string; code?: string; name: string },
) {
	if (!referrer) return false;
	const referredBy = normalizeCustomerText(customer.referredBy);
	if (!referredBy) return false;
	return [referrer.id, referrer.code, referrer.name].some((value) => normalizeCustomerText(value) === referredBy);
}

export function getReportDateContext(definition: ReportDefinition, filters?: ReportFiltersValue) {
	const isDailyReportApi = definition.dataSource === "daily-report-api";
	const isMonthFilter = definition.filterConfig?.monthOnly === true;
	const requiresSingleDate = definition.filterConfig?.singleDate === true;
	const requiresDateRange = definition.filterConfig?.dateRange === true;
	const requiresMonth = definition.filterConfig?.monthOnly === true;

	const defaultReportDate = formatDateToYYYYMMDD(new Date());
	const defaultReportPeriod = defaultReportDate.slice(0, 7);

	const hasRequiredDateFilters =
		requiresMonth || requiresSingleDate
			? Boolean(filters?.fromDate)
			: requiresDateRange
				? Boolean(filters?.fromDate && filters?.toDate)
				: true;

	const reportDate = (isDailyReportApi ? filters?.fromDate : undefined) || filters?.toDate || defaultReportDate;
	const reportPeriod = isMonthFilter
		? filters?.fromDate || filters?.toDate || defaultReportPeriod
		: (filters?.toDate || filters?.fromDate || defaultReportDate).slice(0, 7);

	const rangeDateFrom = filters?.fromDate || reportDate;
	const rangeDateTo = filters?.toDate || rangeDateFrom;

	return {
		hasRequiredDateFilters,
		reportDate,
		reportPeriod,
		rangeDateFrom,
		rangeDateTo,
	};
}
