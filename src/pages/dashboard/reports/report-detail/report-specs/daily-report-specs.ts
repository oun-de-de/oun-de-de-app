import { buildApiDailyReportRows } from "../components/report-table-builders";
import { REPORT_DEFAULT_DATE } from "../constants";
import { buildDailyReportColumns } from "../report-columns/daily-report-columns";
import { REPORT_FILTERS, type BuildReportRowsParams, type ReportDefinitionMap } from "../report-types";
import { REPORT_TITLES } from "../../report-titles";

function buildDailyReportRows({ dailyReport }: BuildReportRowsParams) {
	return buildApiDailyReportRows(dailyReport);
}

export const DAILY_REPORT_SPECS: ReportDefinitionMap = {
	"daily-report": {
		slug: "daily-report",
		title: REPORT_TITLES["daily-report"],
		templateId: "daily-report-summary",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildDailyReportColumns,
		buildRows: buildDailyReportRows,
		dataSource: "daily-report-api",
		filterConfig: REPORT_FILTERS.singleDateOnly,
	},
};
