import { buildCustomerLoanRows, buildEmployeeLoanRows } from "../components/report-table-builders";
import { REPORT_DEFAULT_DATE } from "../constants";
import { buildCustomerLoanColumns, buildEmployeeLoanColumns } from "../report-columns/loan-report-columns";
import { REPORT_FILTERS, type BuildReportRowsParams, type ReportDefinitionMap } from "../report-types";
import { REPORT_TITLES } from "../../report-titles";

function buildCustomerLoanRegisterRows({ loanContent, allCustomers, installmentsByLoanId }: BuildReportRowsParams) {
	return buildCustomerLoanRows(loanContent, allCustomers, installmentsByLoanId);
}

function buildEmployeeLoanLedgerRows({ loanContent, installmentsByLoanId }: BuildReportRowsParams) {
	return buildEmployeeLoanRows(loanContent, installmentsByLoanId);
}

export const LOAN_REPORT_SPECS: ReportDefinitionMap = {
	"customer-transaction": {
		slug: "customer-transaction",
		title: REPORT_TITLES["customer-transaction"],
		templateId: "customer-loan-register",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCustomerLoanColumns,
		buildRows: buildCustomerLoanRegisterRows,
		dataSource: "loan-list",
		loanBorrowerType: "customer",
		filterConfig: REPORT_FILTERS.customerAndDateRange,
	},
	"customer-transaction-detail-by-type": {
		slug: "customer-transaction-detail-by-type",
		title: REPORT_TITLES["customer-transaction-detail-by-type"],
		templateId: "employee-loan-ledger",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildEmployeeLoanColumns,
		buildRows: buildEmployeeLoanLedgerRows,
		dataSource: "loan-list",
		loanBorrowerType: "employee",
		filterConfig: REPORT_FILTERS.dateRangeOnly,
	},
};
