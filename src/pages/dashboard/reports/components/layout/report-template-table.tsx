import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
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

export interface ReportTemplateColumnMeta {
	align?: CellAlign;
	className?: string;
	headerClassName?: string;
}

export type ReportTemplateColumn = ColumnDef<ReportTemplateRow, React.ReactNode> & {
	id: string;
	meta?: ReportTemplateColumnMeta;
};

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

function getColumnMeta(columnDef: ColumnDef<ReportTemplateRow, React.ReactNode>): ReportTemplateColumnMeta {
	return (columnDef.meta as ReportTemplateColumnMeta | undefined) ?? {};
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
	const columnVisibility = Object.fromEntries(hiddenColumnKeys.map((key) => [key, false]));
	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: {
			columnVisibility,
		},
		getRowId: (row) => row.key,
	});
	const visibleColumns = table.getVisibleLeafColumns();
	const tableColSpan = Math.max(visibleColumns.length, 1);

	return (
		<div
			className={cn(
				"flex flex-col gap-6 rounded-md border bg-white p-6 print:gap-4 print:rounded-none print:border-0 print:p-0",
				className,
			)}
		>
			{showSections?.header !== false &&
				(headerContent || (
					<div className="flex flex-col items-center gap-1 text-center print:gap-0.5">
						<div className="text-lg font-bold text-slate-700 print:text-[22px] print:tracking-[0.02em]">{title}</div>
						{subtitle && (
							<div className="pb-2 text-base font-semibold text-slate-600 print:pb-4 print:text-[16px]">{subtitle}</div>
						)}
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
				<table className="w-full border-collapse border text-xs text-slate-700 print:text-[11px]">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="bg-slate-50 text-slate-600 uppercase">
								{headerGroup.headers.map((header) => {
									const meta = getColumnMeta(header.column.columnDef);
									return (
										<th
											key={header.id}
											className={cn(
												"border p-2.5 font-semibold print:px-2 print:py-1.5",
												alignClass[meta?.align ?? "center"],
												meta?.headerClassName,
											)}
										>
											{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
										</th>
									);
								})}
							</tr>
						))}
					</thead>

					<tbody>
						{rows.length === 0 ? (
							<tr className="text-slate-400">
								<td colSpan={tableColSpan} className="p-10 text-center">
									{emptyText}
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row) => (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => {
										const meta = getColumnMeta(cell.column.columnDef);
										return (
											<td
												key={cell.id}
												className={cn(
													"border p-2.5 print:px-2 print:py-1.5",
													alignClass[meta?.align ?? "center"],
													meta?.className,
												)}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{summaryRows.length > 0 && (
				<div className="ml-auto flex flex-col items-end gap-1 text-sm font-semibold text-slate-700 print:mt-2 print:text-[18px]">
					{summaryRows.map((summaryRow) => (
						<div key={summaryRow.key}>
							<span>{summaryRow.label}</span>
							<span>{summaryRow.value}</span>
						</div>
					))}
				</div>
			)}

			<div className="flex justify-between text-[10px] text-slate-400 print:mt-3 print:text-[11px]">
				<div className="flex flex-col gap-1">
					{showSections?.signature && <span>Signature: ________________</span>}
					{showSections?.timestamp !== false && timestampText && <span>{timestampText}</span>}
				</div>
				{showSections?.footer !== false && footerText && <span>{footerText}</span>}
			</div>
		</div>
	);
}
