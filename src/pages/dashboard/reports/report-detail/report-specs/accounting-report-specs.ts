import { REPORT_TITLES } from "../../report-titles";
import {
	buildCashTransactionReportRows,
	buildMonthlyReportDetailRows,
	// buildTrialBalanceRows,
} from "../components/report-table-builders";
import { REPORT_DEFAULT_DATE } from "../constants";
import {
	buildCashTransactionColumns,
	buildIncomeExpenseLedgerColumns,
	buildLedgerColumns,
	// buildTrialBalanceColumns,
} from "../report-columns/accounting-report-columns";
import { type BuildReportRowsParams, REPORT_FILTERS, type ReportDefinitionMap } from "../report-types";

function buildCashTransactionReportApiRows({ monthlyReportDetails }: BuildReportRowsParams) {
	return buildCashTransactionReportRows(monthlyReportDetails);
}

function buildGeneralLedgerApiRows({ monthlyReportDetails }: BuildReportRowsParams) {
	return buildMonthlyReportDetailRows(monthlyReportDetails);
}

// function buildTrialBalanceReportRows() {
// 	return buildTrialBalanceRows();
// }

function buildIncomeExpenseApiReportRows({ monthlyReportDetails }: BuildReportRowsParams) {
	return buildMonthlyReportDetailRows(monthlyReportDetails);
}

export const ACCOUNTING_REPORT_SPECS: ReportDefinitionMap = {
	"cash-transaction-report": {
		slug: "cash-transaction-report",
		title: REPORT_TITLES["cash-transaction-report"],
		templateId: "cash-transaction-report",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCashTransactionColumns,
		buildRows: buildCashTransactionReportApiRows,
		dataSource: "monthly-report-details-api",
		filterConfig: REPORT_FILTERS.dateRangeOnly,
	},
	"general-ledger": {
		slug: "general-ledger",
		title: REPORT_TITLES["general-ledger"],
		templateId: "income-expense-ledger",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildLedgerColumns,
		buildRows: buildGeneralLedgerApiRows,
		dataSource: "monthly-report-details-api",
		filterConfig: REPORT_FILTERS.monthOnly,
	},
	// "trial-balance": {
	// 	slug: "trial-balance",
	// 	title: "Trial Balance",
	// 	templateId: "unsupported",
	// 	subtitle: REPORT_DEFAULT_DATE,
	// 	buildColumns: buildTrialBalanceColumns,
	// 	buildRows: buildTrialBalanceReportRows,
	// 	dataSource: "accounting-mock",
	// 	filterConfig: REPORT_FILTERS.noFilters,
	// },
	"balance-sheet": {
		slug: "balance-sheet",
		title: REPORT_TITLES["balance-sheet"],
		templateId: "income-expense-ledger",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildIncomeExpenseLedgerColumns,
		buildRows: buildIncomeExpenseApiReportRows,
		dataSource: "monthly-report-details-api",
		filterConfig: REPORT_FILTERS.monthOnly,
	},
};
