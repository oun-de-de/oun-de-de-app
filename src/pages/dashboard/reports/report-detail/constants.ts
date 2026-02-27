import type { ReportColumnVisibility, ReportSectionVisibility } from "../components/layout/report-toolbar";

export const REPORT_KHMER_TITLE = "ហាងម្រុននីការកក លឹម មុន II";
export const REPORT_ENGLISH_TITLE = "OPEN INVOICE DETAIL BY CUSTOMER";
export const REPORT_DEFAULT_DATE = "21/01/2026";
export const REPORT_TIMESTAMP_TEXT = "By Thavit, Wed 21/01/2026 16:05:44";
export const REPORT_FOOTER_TEXT = "© 2014-2026 Rabbit Technology (v4.5.4-beta-5)";

export const DEFAULT_REPORT_SECTIONS: ReportSectionVisibility = {
	header: true,
	filter: true,
	footer: true,
	timestamp: true,
	signature: false,
};

export const DEFAULT_REPORT_COLUMNS: ReportColumnVisibility = {
	refNo: true,
	category: false,
	geography: false,
	address: false,
	phone: false,
};
