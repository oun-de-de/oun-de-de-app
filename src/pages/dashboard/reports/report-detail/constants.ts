import { formatDateToYYYYMMDD } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import type { ReportColumnVisibility, ReportSectionVisibility } from "../components/layout/report-toolbar";
import { REPORT_TITLES } from "../report-titles";

const today = new Date();

function formatDateToDDMMYYYY(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
}

export function formatReportTimestamp(employeeName: string, date: Date): string {
	const weekday = new Intl.DateTimeFormat("en-US", {
		weekday: "short",
	}).format(date);
	const time = new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).format(date);

	return `By ${employeeName}, ${weekday} ${formatDateToDDMMYYYY(date)} ${time}`;
}

export const REPORT_KHMER_TITLE = "ហាងម្រុននីការកក លឹម មុន II";
export const REPORT_ENGLISH_TITLE = REPORT_TITLES["open-invoice-on-period-by-group"].toUpperCase();
export const REPORT_DEFAULT_DATE = formatDateToDDMMYYYY(today);
export const REPORT_DEFAULT_DATE_INPUT = formatDateToYYYYMMDD(today);
export const REPORT_FOOTER_TEXT = "";

export const DEFAULT_REPORT_SECTIONS: ReportSectionVisibility = {
	header: true,
	filter: true,
	footer: true,
	timestamp: true,
	signature: false,
};

export const DEFAULT_REPORT_COLUMNS: ReportColumnVisibility = {};
