import type { CycleReportRow, MainReportRow } from "../types/report-table.types";

export const SAMPLE_MAIN_ROWS: MainReportRow[] = [
	{
		invoiceNo: "INV-000123",
		invoiceDate: "2026-02-01",
		customer: "Nguyen Van A",
		couponId: "CP-88921",
		cycle: "CYC-2026-02",
		amountVnd: "350,000",
		paymentTerm: "Yes",
		createdBy: "Huy",
	},
	{
		invoiceNo: "INV-000124",
		invoiceDate: "2026-02-01",
		customer: "Nguyen Van B",
		couponId: "CP-88922",
		cycle: "-",
		amountVnd: "120,000",
		paymentTerm: "No",
		createdBy: "Lan",
	},
	{
		invoiceNo: "INV-000125",
		invoiceDate: "2026-02-02",
		customer: "Nguyen Van A",
		couponId: "CP-88945",
		cycle: "CYC-2026-02",
		amountVnd: "420,000",
		paymentTerm: "Yes",
		createdBy: "Huy",
	},
];

export const SAMPLE_CYCLE_ROWS: CycleReportRow[] = [
	{
		customer: "Nguyen Van A",
		cycle: "CYC-2026-02",
		openingBalance: "300,000",
		invoiceTotal: "1,950,000",
		paid: "1,500,000",
		outstanding: "750,000",
	},
	{
		customer: "Nguyen Van C",
		cycle: "CYC-2026-02",
		openingBalance: "0",
		invoiceTotal: "800,000",
		paid: "800,000",
		outstanding: "0",
	},
];
