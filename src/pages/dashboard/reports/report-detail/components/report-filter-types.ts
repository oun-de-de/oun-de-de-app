import type { ReportFilterConfig } from "../report-types";

export type ReportFiltersValue = {
	customerId: string;
	customerTypeId: string;
	productName: string;
	fromDate: string;
	toDate: string;
	useDateRange: boolean;
	showDetail?: boolean;
};

export type ReportFiltersProps = {
	value: ReportFiltersValue;
	onSubmit: (value: ReportFiltersValue) => void;
	filterConfig: ReportFilterConfig;
	reportSlug: string;
};
