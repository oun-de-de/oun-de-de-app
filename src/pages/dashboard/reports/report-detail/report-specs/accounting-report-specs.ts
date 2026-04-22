import {
	buildMonthlyReportDetailRows,
	// buildTrialBalanceRows,
} from "../components/report-table-builders";
import { REPORT_DEFAULT_DATE } from "../constants";
import {
	buildLedgerColumns,
	buildIncomeExpenseLedgerColumns,
	// buildTrialBalanceColumns,
} from "../report-columns/accounting-report-columns";
import { REPORT_FILTERS, type BuildReportRowsParams, type ReportDefinitionMap } from "../report-types";
import { REPORT_TITLES } from "../../report-titles";

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
