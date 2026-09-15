import type { ReportFilterConfig } from "../report-types";

export type ReportFiltersValue = {
	customerId: string;
	customerTypeId: string;
	productName: string;
	employeeId?: string;
	fromDate: string;
	toDate: string;
	useDateRange: boolean;
	showDetail?: boolean;
	branchId?: string;
	geography?: string;
	category?: string;
	term?: string;
	job?: string;
	// Cash Transaction Report only — matches classifyCashTransactionType's output (invoice/receipt/
	// expense/revenue/loan), not a real BE journal-type id. "all"/undefined = no filter.
	journalType?: string;
};

export type ReportFiltersProps = {
	value: ReportFiltersValue;
	onSubmit: (value: ReportFiltersValue) => void;
	filterConfig: ReportFilterConfig;
	reportSlug: string;
};
