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
		<div className={cn("flex flex-col gap-4 rounded-none border-0 bg-white p-0 text-black", className)}>
			{showSections?.header !== false &&
				(headerContent || (
					<div className="flex flex-col items-center gap-1 text-center text-black">
						<div className="text-[11px] font-normal">{title}</div>
						<div className="pb-0 text-[22px] font-bold">ហាងចក្រទឹកកក លឹម ច័ន្ទ II</div>
						<div className="pb-3 text-[13px] font-semibold underline">TEL: 070669898</div>
						{subtitle && <div className="text-base font-semibold text-slate-600">{subtitle}</div>}
					</div>
				))}

			{metaColumns.length > 0 && (
				<div className="mb-2 ml-1 grid grid-cols-1 gap-4 text-[13px] font-bold text-black md:grid-cols-3">
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

			<div className="w-full overflow-x-auto px-6">
				<table className="w-full border-separate border-spacing-0 border-l border-t border-black text-[11px] text-black">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="bg-transparent text-black uppercase">
								{headerGroup.headers.map((header) => {
									const meta = getColumnMeta(header.column.columnDef);
									return (
										<th
											key={header.id}
											className={cn(
												"border-b border-r border-black px-2 py-1.5 font-bold",
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
								<td colSpan={tableColSpan} className="border-b border-r border-black p-10 text-center">
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
													"border-b border-r border-black px-2 py-1.5",
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

					{summaryRows.length > 0 && (
						<tfoot>
							{summaryRows.map((summaryRow) => (
								<tr key={summaryRow.key} className="text-black">
									<td
										colSpan={tableColSpan - 1}
										className="border-b border-r border-black px-2 py-2 text-right text-[12px] font-bold uppercase whitespace-nowrap"
									>
										{summaryRow.label}
									</td>
									<td className="border-b border-r border-black px-2 py-2 text-right text-[12px] font-bold whitespace-nowrap">
										{summaryRow.value}
									</td>
								</tr>
							))}
						</tfoot>
					)}
				</table>
			</div>

			<div className="mt-3 flex justify-between text-[11px] text-black">
				<div className="flex flex-col gap-1">
					{showSections?.signature && <span>Signature: ________________</span>}
					{showSections?.timestamp !== false && timestampText && <span>{timestampText}</span>}
				</div>
				{showSections?.footer !== false && footerText && <span>{footerText}</span>}
			</div>
		</div>
	);
}
