import { REPORT_TITLES } from "../../report-titles";
import { normalizeCustomerText } from "../components/report-data-utils";
import { buildCustomerListRows, buildCycleReportRows } from "../components/report-table-builders";
import { REPORT_DEFAULT_DATE } from "../constants";
import { buildCustomerListColumns, buildCycleColumns } from "../report-columns/core-report-columns";
import { type BuildReportRowsParams, REPORT_FILTERS, type ReportDefinitionMap } from "../report-types";

function buildCycleSummaryRows({ openInvoiceReport, showDetail, filteredCustomers, filters }: BuildReportRowsParams) {
	let groups = openInvoiceReport ?? [];
	if (filters?.customerId || filters?.customerTypeId) {
		const allowed = new Set(filteredCustomers.map((c) => normalizeCustomerText(c.name)));
		groups = groups.filter((g) => allowed.has(normalizeCustomerText(g.customerName)));
	}
	return buildCycleReportRows(groups, showDetail);
}

function buildCustomerListReportRows({ filteredCustomers }: BuildReportRowsParams) {
	return buildCustomerListRows(filteredCustomers);
}

export const CORE_REPORT_SPECS: ReportDefinitionMap = {
	"open-invoice-on-period-by-group": {
		slug: "open-invoice-on-period-by-group",
		title: REPORT_TITLES["open-invoice-on-period-by-group"],
		templateId: "cycle-summary",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCycleColumns,
		buildRows: buildCycleSummaryRows,
		dataSource: "open-invoice-report-api",
		filterConfig: { ...REPORT_FILTERS.customerAndDateRange, showDetail: true },
	},
	"customer-list": {
		slug: "customer-list",
		title: REPORT_TITLES["customer-list"],
		templateId: "customer-list",
		buildColumns: buildCustomerListColumns,
		buildRows: buildCustomerListReportRows,
		dataSource: "customer-list",
		filterConfig: REPORT_FILTERS.customerOnly,
	},
};
