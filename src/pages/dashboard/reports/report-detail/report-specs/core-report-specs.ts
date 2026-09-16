import { REPORT_TITLES } from "../../report-titles";
import { buildCustomerListRows } from "../components/report-table-builders";
import { buildCustomerListColumns } from "../report-columns/core-report-columns";
import { type BuildReportRowsParams, REPORT_FILTERS, type ReportDefinitionMap } from "../report-types";

function buildCustomerListReportRows({ filteredCustomers }: BuildReportRowsParams) {
	return buildCustomerListRows(filteredCustomers);
}

export const CORE_REPORT_SPECS: ReportDefinitionMap = {
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
