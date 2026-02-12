import type React from "react";
import { cn } from "@/core/utils";
import type { ReportSectionVisibility } from "./report-toolbar";

type CellAlign = "left" | "center" | "right";

const alignClass: Record<CellAlign, string> = {
	left: "text-left",
	center: "text-center",
	right: "text-right",
};

export interface ReportTemplateMetaColumn {
	key: string;
	rows: React.ReactNode[];
	align?: CellAlign;
	className?: string;
}

export interface ReportTemplateColumn {
	key: string;
	label: string;
	align?: CellAlign;
	className?: string;
	headerClassName?: string;
}

export interface ReportTemplateSummaryRow {
	key: string;
	label: React.ReactNode;
	value: React.ReactNode;
}

export interface ReportTemplateRow {
	key: string;
	cells: Record<string, React.ReactNode>;
}

interface ReportTemplateTableProps {
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	headerContent?: React.ReactNode;
	metaColumns?: ReportTemplateMetaColumn[];
	columns: ReportTemplateColumn[];
	rows: ReportTemplateRow[];
	hiddenColumnKeys?: string[];
	summaryRows?: ReportTemplateSummaryRow[];
	emptyText?: React.ReactNode;
	showSections?: ReportSectionVisibility;
	timestampText?: React.ReactNode;
	footerText?: React.ReactNode;
	className?: string;
}

export function ReportTemplateTable({
	title,
	subtitle,
	headerContent,
	metaColumns = [],
	columns,
	rows,
	hiddenColumnKeys = [],
	summaryRows = [],
	emptyText = "No Data",
	showSections,
	timestampText,
	footerText,
	className,
}: ReportTemplateTableProps) {
	const hiddenColumnKeySet = new Set(hiddenColumnKeys);
	const visibleColumns = columns.filter((column) => !hiddenColumnKeySet.has(column.key));
	const tableColSpan = Math.max(visibleColumns.length, 1);

	return (
		<div className={cn("flex flex-col gap-6 rounded-md border bg-white p-6", className)}>
			{showSections?.header !== false &&
				(headerContent || (
					<div className="flex flex-col items-center gap-1 text-center">
						<div className="text-lg font-bold text-slate-700">{title}</div>
						{subtitle && <div className="text-base font-semibold text-slate-600">{subtitle}</div>}
					</div>
				))}

			{metaColumns.length > 0 && (
				<div className="grid grid-cols-1 gap-4 text-xs text-slate-500 md:grid-cols-3">
					{metaColumns.map((column) => {
						const align = column.align ?? "left";
						return (
							<div key={column.key} className={cn("flex flex-col gap-1", alignClass[align], column.className)}>
								{column.rows.map((row) => (
									<span key={`${column.key}:${String(row)}`}>{row}</span>
								))}
							</div>
						);
					})}
				</div>
			)}

			<div className="w-full overflow-x-auto">
				<table className="w-full border-collapse border text-xs text-slate-700">
					<thead>
						<tr className="bg-slate-50 text-slate-600 uppercase">
							{visibleColumns.map((column) => (
								<th
									key={column.key}
									className={cn(
										"border p-2.5 font-semibold",
										alignClass[column.align ?? "center"],
										column.headerClassName,
									)}
								>
									{column.label}
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{rows.length === 0 ? (
							<tr className="text-slate-400">
								<td colSpan={tableColSpan} className="p-10 text-center">
									{emptyText}
								</td>
							</tr>
						) : (
							rows.map((row) => (
								<tr key={row.key}>
									{visibleColumns.map((column) => (
										<td
											key={`${row.key}-${column.key}`}
											className={cn("border p-2.5", alignClass[column.align ?? "center"], column.className)}
										>
											{row.cells[column.key]}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{summaryRows.length > 0 && (
				<div className="ml-auto flex flex-col items-end gap-1 text-sm font-semibold text-slate-700">
					{summaryRows.map((summaryRow) => (
						<div key={summaryRow.key}>
							<span>{summaryRow.label}</span>
							<span>{summaryRow.value}</span>
						</div>
					))}
				</div>
			)}

			<div className="flex justify-between text-[10px] text-slate-400">
				<div className="flex flex-col gap-1">
					{showSections?.signature && <span>Signature: ________________</span>}
					{showSections?.timestamp !== false && timestampText && <span>{timestampText}</span>}
				</div>
				{showSections?.footer !== false && footerText && <span>{footerText}</span>}
			</div>
		</div>
	);
}
