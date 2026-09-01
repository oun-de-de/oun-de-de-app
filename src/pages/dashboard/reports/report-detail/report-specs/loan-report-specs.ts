import { REPORT_TITLES } from "../../report-titles";
import { buildCustomerLoanRows, buildCustomerTransactionDetailByTypeRows } from "../components/report-table-builders";
import { REPORT_DEFAULT_DATE } from "../constants";
import { buildCustomerTransactionDetailByTypeColumns } from "../report-columns/invoice-report-columns";
import { buildCustomerLoanColumns } from "../report-columns/loan-report-columns";
import { type BuildReportRowsParams, REPORT_FILTERS, type ReportDefinitionMap } from "../report-types";

function buildCustomerLoanRegisterRows({ loanContent, allCustomers, installmentsByLoanId }: BuildReportRowsParams) {
	return buildCustomerLoanRows(loanContent, allCustomers, installmentsByLoanId);
}

function buildCustomerTransactionDetailByTypeReportRows({ invoices, previewRows, payments }: BuildReportRowsParams) {
	return buildCustomerTransactionDetailByTypeRows(invoices, previewRows, payments);
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
		templateId: "customer-transaction-detail-by-type",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCustomerTransactionDetailByTypeColumns,
		buildRows: buildCustomerTransactionDetailByTypeReportRows,
		dataSource: "invoice-export",
		needsPreviewRows: true,
		filterConfig: {
			...REPORT_FILTERS.customerAndDateRange,
			customerType: true,
		},
	},
};
