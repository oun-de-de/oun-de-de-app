import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import React from "react";
import styled from "styled-components";
import { cn } from "@/core/utils";
import type { ReportSectionVisibility } from "./report-toolbar";

type CellAlign = "left" | "center" | "right";

const alignClass: Record<CellAlign, string> = {
	left: "text-left",
	center: "text-center",
	right: "text-right",
};

type ReportTableInstance = ReturnType<typeof useReactTable<ReportTemplateRow>>;

function getAlignClass(align?: CellAlign) {
	return alignClass[align ?? "center"];
}

function renderEmptyRow(colSpan: number, emptyText: React.ReactNode) {
	return (
		<EmptyRow>
			<EmptyRowCell colSpan={colSpan}>{emptyText}</EmptyRowCell>
		</EmptyRow>
	);
}

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

function renderMetaColumns(metaColumns: ReportTemplateMetaColumn[]) {
	return metaColumns.map((column) => (
		<MetaColumn key={column.key} className={cn(getAlignClass(column.align ?? "left"), column.className)}>
			{column.rows.map((row) => (
				<MetaRow key={`${column.key}:${String(row)}`}>{row}</MetaRow>
			))}
		</MetaColumn>
	));
}

function renderHeaderGroups(table: ReportTableInstance) {
	return table.getHeaderGroups().map((headerGroup) => (
		<TableHeaderRow key={headerGroup.id}>
			{headerGroup.headers.map((header) => {
				const meta = getColumnMeta(header.column.columnDef);
				return (
					<HeaderCell key={header.id} className={cn(getAlignClass(meta?.align), meta?.headerClassName)}>
						{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
					</HeaderCell>
				);
			})}
		</TableHeaderRow>
	));
}

function renderRows(table: ReportTableInstance, hasNoRows: boolean, tableColSpan: number, emptyText: React.ReactNode) {
	if (hasNoRows) {
		return renderEmptyRow(tableColSpan, emptyText);
	}

	return table.getRowModel().rows.map((row) => (
		<tr key={row.id}>
			{row.getVisibleCells().map((cell) => {
				const meta = getColumnMeta(cell.column.columnDef);
				return (
					<BodyCell key={cell.id} className={cn(getAlignClass(meta?.align), meta?.className)}>
						{flexRender(cell.column.columnDef.cell, cell.getContext())}
					</BodyCell>
				);
			})}
		</tr>
	));
}

function renderSummaryRows(summaryRows: ReportTemplateSummaryRow[], summaryLabelColSpan: number) {
	return (
		<tfoot>
			{summaryRows.map((summaryRow) => (
				<SummaryRow key={summaryRow.key}>
					<SummaryLabelCell colSpan={summaryLabelColSpan}>{summaryRow.label}</SummaryLabelCell>
					<SummaryValueCell>{summaryRow.value}</SummaryValueCell>
				</SummaryRow>
			))}
		</tfoot>
	);
}

export const ReportTemplateTable = React.memo(function ReportTemplateTable({
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
	const columnVisibility = React.useMemo(
		() => Object.fromEntries(hiddenColumnKeys.map((key) => [key, false])),
		[hiddenColumnKeys],
	);

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
	const summaryLabelColSpan = Math.max(tableColSpan - 1, 1);
	const hasNoRows = rows.length === 0;

	return (
		<ReportTableRoot className={className}>
			{showSections?.header !== false &&
				(headerContent || (
					<ReportHeader>
						<HeaderTopText>{title}</HeaderTopText>
						<HeaderStoreText>ហាងចក្រទឹកកក លឹម ច័ន្ទ II</HeaderStoreText>
						<HeaderPhoneText>TEL: 070669898</HeaderPhoneText>
						{subtitle && <HeaderSubtitle>{subtitle}</HeaderSubtitle>}
					</ReportHeader>
				))}

			{metaColumns.length > 0 && <MetaContainer>{renderMetaColumns(metaColumns)}</MetaContainer>}

			<ReportTableWrapper>
				<ReportTableElement>
					<thead>{renderHeaderGroups(table)}</thead>

					<tbody>{renderRows(table, hasNoRows, tableColSpan, emptyText)}</tbody>

					{summaryRows.length > 0 && renderSummaryRows(summaryRows, summaryLabelColSpan)}
				</ReportTableElement>
			</ReportTableWrapper>

			<FooterSection>
				<FooterMetaColumn>
					{showSections?.signature && <span>Signature: ________________</span>}
					{showSections?.timestamp !== false && timestampText && <span>{timestampText}</span>}
				</FooterMetaColumn>
				{showSections?.footer !== false && footerText && <span>{footerText}</span>}
			</FooterSection>
		</ReportTableRoot>
	);
});

//#region Styled Components

const ReportTableRoot = styled.div.attrs({
	className: "flex flex-col gap-4 rounded-none border-0 bg-white p-0 text-black",
})``;

const ReportHeader = styled.div.attrs({
	className: "flex flex-col items-center gap-1 text-center text-black",
})``;

const MetaContainer = styled.div.attrs({
	className: "mb-2 grid grid-cols-1 gap-4 text-[13px] font-bold text-black md:grid-cols-3",
})``;

const MetaColumn = styled.div.attrs({
	className: "flex flex-col gap-1",
})``;

const MetaRow = styled.span.attrs({
	className: "whitespace-pre-line",
})``;

const ReportTableWrapper = styled.div.attrs({
	className: "w-full overflow-x-auto px-2 print:overflow-visible print:px-0",
})``;

const ReportTableElement = styled.table.attrs({
	className:
		"w-full border-separate border-spacing-0 border-l border-t border-black text-[11px] text-black print:w-full print:text-[10px]",
})``;

const TableHeaderRow = styled.tr.attrs({
	className: "bg-transparent text-black uppercase",
})``;

const HeaderCell = styled.th.attrs({
	className: "border-b border-r border-black px-2 py-1.5 align-top font-bold break-words print:px-1 print:py-1",
})``;

const BodyCell = styled.td.attrs({
	className: "border-b border-r border-black px-2 py-1.5 align-top break-words print:px-1 print:py-1",
})``;

const EmptyRow = styled.tr.attrs({
	className: "text-slate-400",
})``;

const EmptyRowCell = styled.td.attrs({
	className: "border-b border-r border-black p-10 text-center",
})``;

const SummaryRow = styled.tr.attrs({
	className: "text-black",
})``;

const SummaryLabelCell = styled.td.attrs({
	className:
		"border-b border-r border-black px-2 py-2 text-right text-[12px] font-bold uppercase whitespace-nowrap print:px-1 print:py-1",
})``;

const SummaryValueCell = styled.td.attrs({
	className:
		"border-b border-r border-black px-2 py-2 text-right text-[12px] font-bold whitespace-nowrap print:px-1 print:py-1",
})``;

const FooterSection = styled.div.attrs({
	className: "mt-3 flex justify-between text-[11px] text-black",
})``;

const FooterMetaColumn = styled.div.attrs({
	className: "flex flex-col gap-1",
})``;

const HeaderTopText = styled.div.attrs({
	className: "text-[11px] font-normal",
})``;

const HeaderStoreText = styled.div.attrs({
	className: "pb-0 text-[22px] font-bold",
})``;

const HeaderPhoneText = styled.div.attrs({
	className: "pb-3 text-[13px] font-semibold underline",
})``;

const HeaderSubtitle = styled.div.attrs({
	className: "text-base font-semibold text-slate-600",
})``;
//#endregion
