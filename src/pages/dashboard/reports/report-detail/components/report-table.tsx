import {
	type ReportTemplateColumn,
	type ReportTemplateMetaColumn,
	type ReportTemplateRow,
	ReportTemplateTable,
} from "../../components/layout/report-template-table";
import type { ReportColumnVisibility, ReportSectionVisibility } from "../../components/layout/report-toolbar";
import {
	REPORT_DEFAULT_DATE,
	REPORT_ENGLISH_TITLE,
	REPORT_FOOTER_TEXT,
	REPORT_KHMER_TITLE,
	REPORT_TIMESTAMP_TEXT,
} from "../constants";

interface ReportTableProps {
	showSections?: ReportSectionVisibility;
	showColumns?: ReportColumnVisibility;
	className?: string;
	rows?: ReportTemplateRow[];
	title?: string;
	subtitle?: string;
	totalCustomer?: number;
	totalBalance?: number;
	timestampText?: string;
	footerText?: string;
}

export function ReportTable({
	showSections,
	showColumns,
	className,
	rows = [],
	title = REPORT_ENGLISH_TITLE,
	subtitle = REPORT_DEFAULT_DATE,
	totalCustomer = 0,
	totalBalance = 0,
	timestampText = REPORT_TIMESTAMP_TEXT,
	footerText = REPORT_FOOTER_TEXT,
}: ReportTableProps) {
	const hiddenColumnKeys = [
		showColumns?.refNo === false ? "refNo" : null,
		showColumns?.category === false ? "category" : null,
		showColumns?.geography === false ? "geography" : null,
		showColumns?.address === false ? "address" : null,
		showColumns?.phone === false ? "phone" : null,
	].filter((key): key is string => key !== null);

	const columns: ReportTemplateColumn[] = [
		{ key: "no", label: "NO" },
		{ key: "customer", label: "CUSTOMER", align: "left" },
		{ key: "date", label: "DATE" },
		{ key: "refNo", label: "REF NO" },
		{ key: "employee", label: "EMPLOYEE" },
		{ key: "category", label: "CATEGORY" },
		{ key: "geography", label: "GEOGRAPHY" },
		{ key: "address", label: "ADDRESS" },
		{ key: "phone", label: "PHONE" },
		{ key: "originalAmount", label: "ORIGINAL AMOUNT", align: "right" },
		{ key: "received", label: "RECEIVED", align: "right" },
		{ key: "balance", label: "BALANCE", align: "right" },
	];

	const metaColumns: ReportTemplateMetaColumn[] = [
		{
			key: "left-meta",
			rows: ['Branch: ["01 : Phonm Penh"]', "Customer: [All]"],
		},
		{
			key: "center-meta",
			rows: ["Term: [All]", "Category: [All]"],
		},
		{
			key: "right-meta",
			rows: ["Geography: [All]", "Employee: [All]"],
			align: "right",
		},
	];

	return (
		<ReportTemplateTable
			className={className}
			showSections={showSections}
			title={title}
			subtitle={subtitle}
			headerContent={
				<div className="flex flex-col items-center gap-1 text-center">
					<div className="text-2xl font-bold leading-none text-slate-700">{REPORT_KHMER_TITLE}</div>
					<div className="text-base font-semibold uppercase tracking-wide text-slate-600 underline underline-offset-2">
						{title}
					</div>
					<div className="text-2xl font-semibold text-slate-700">{subtitle}</div>
				</div>
			}
			metaColumns={metaColumns}
			columns={columns}
			hiddenColumnKeys={hiddenColumnKeys}
			rows={rows}
			emptyText="No Data"
			summaryRows={[
				{ key: "total-customer", label: "Total Customer :", value: String(totalCustomer) },
				{ key: "total-balance", label: "Total Balance :", value: `${totalBalance.toLocaleString()} ៛` },
			]}
			timestampText={timestampText}
			footerText={footerText}
		/>
	);
}
