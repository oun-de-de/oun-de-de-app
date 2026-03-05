import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import styled from "styled-components";
import { useAuthUser } from "@/core/services/auth/hooks/use-auth";
import {
	getPaperSizePageValue,
	getPaperSizeWrapperClassName,
	getTemplateClassName,
	type PaperSizeMode,
	type TemplateMode,
} from "../../invoice/export-preview/constants";
import {
	type ReportTemplateMetaColumn,
	type ReportTemplateRow,
	ReportTemplateTable,
} from "../../reports/components/layout/report-template-table";
import { type ReportSectionVisibility, ReportToolbar } from "../../reports/components/layout/report-toolbar";
import {
	DEFAULT_REPORT_SECTIONS,
	formatReportTimestamp,
	REPORT_FOOTER_TEXT,
	REPORT_KHMER_TITLE,
} from "../../reports/report-detail/constants";
import { useInventoryItem, useInventoryTransactions } from "../hooks/use-inventory-items";
import { getExpenseText, mapTransactionsToRows } from "../utils/transaction-columns-utils";
import { PREVIEW_COLUMNS } from "./components/equipment-print-columns";

type PreviewRow = ReturnType<typeof mapTransactionsToRows>[number];

const HEADER_TITLE = "Inventory Stock Report";
const HEADER_PHONE = "TEL: 070669898";
const EMPTY_LOADING_TEXT = "Loading...";
const EMPTY_NOT_FOUND_TEXT = "Transaction not found";

function parseQuery(search: string) {
	const query = new URLSearchParams(search);
	return {
		itemId: query.get("itemId")?.trim() ?? "",
		transactionId: query.get("txId")?.trim() ?? "",
	};
}

function buildPreviewMetaColumns(
	item: { name?: string; code?: string; quantityOnHand?: number } | null | undefined,
	transactionId: string,
): ReportTemplateMetaColumn[] {
	return [
		{
			key: "item",
			rows: [`Item: ${item?.name ?? "-"}`, `Code: ${item?.code ?? "-"}`],
			align: "left",
		},
		{
			key: "template",
			rows: ["Template: Q#8 Inventory"],
			align: "center",
		},
		{
			key: "transaction",
			rows: [`Transaction ID: ${transactionId || "-"}`, `Current Qty: ${item?.quantityOnHand ?? "-"}`],
			align: "right",
		},
	];
}

function toReportRow(row: PreviewRow): ReportTemplateRow {
	return {
		key: row.id,
		cells: {
			date: row.date,
			type: row.type,
			reason: row.reason,
			quantity: row.quantity,
			expense: getExpenseText(row.expense),
			memo: row.memo,
		},
	};
}

export default function EquipmentExportPreviewPage() {
	const location = useLocation();
	const authUser = useAuthUser();
	const { itemId, transactionId } = useMemo(() => parseQuery(location.search), [location.search]);
	const { data: item, isLoading: isItemLoading } = useInventoryItem(itemId || undefined);
	const { data: transactions = [], isLoading: isTransactionsLoading } = useInventoryTransactions(itemId || undefined);
	const [showSections, setShowSections] = useState<ReportSectionVisibility>({
		...DEFAULT_REPORT_SECTIONS,
		filter: false,
		signature: true,
	});
	const [templateMode, setTemplateMode] = useState<TemplateMode>("standard");
	const [paperSizeMode, setPaperSizeMode] = useState<PaperSizeMode>("a4");
	const selectedTransaction = useMemo<PreviewRow | null>(() => {
		const raw = transactions.find((entry) => entry.id === transactionId);
		if (!raw) return null;
		return mapTransactionsToRows([raw])[0];
	}, [transactions, transactionId]);

	const reportRows = useMemo<ReportTemplateRow[]>(() => {
		if (!selectedTransaction) return [];
		return [toReportRow(selectedTransaction)];
	}, [selectedTransaction]);

	const isLoading = isItemLoading || isTransactionsLoading;
	const emptyText = isLoading ? EMPTY_LOADING_TEXT : EMPTY_NOT_FOUND_TEXT;
	const handlePrint = useCallback(() => window.print(), []);

	const metaColumns = useMemo<ReportTemplateMetaColumn[]>(
		() => buildPreviewMetaColumns(item, transactionId),
		[item, transactionId],
	);

	const timestampText = useMemo(() => {
		const employeeName = authUser?.data?.username || "Unknown";
		return formatReportTimestamp(employeeName, new Date());
	}, [authUser]);

	const pageSizeValue = useMemo(() => getPaperSizePageValue(paperSizeMode), [paperSizeMode]);

	useEffect(() => {
		const styleId = "equipment-print-page-size-style";
		let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = `@media print { @page { size: ${pageSizeValue}; margin: 6mm; } }`;

		return () => {
			styleEl?.remove();
		};
	}, [pageSizeValue]);

	return (
		<PageRoot>
			<PrintHiddenSection>
				<StyledReportToolbar
					showSections={showSections}
					onShowSectionsChange={setShowSections}
					templateMode={templateMode}
					onTemplateModeChange={setTemplateMode}
					paperSizeMode={paperSizeMode}
					onPaperSizeModeChange={setPaperSizeMode}
					onPrint={handlePrint}
				/>
			</PrintHiddenSection>

			<PrintTableWrapper $paperSizeMode={paperSizeMode}>
				<StyledReportTemplateTable
					$templateMode={templateMode}
					showSections={showSections}
					title={HEADER_TITLE}
					subtitle={selectedTransaction?.date ?? "-"}
					headerContent={
						<PrintHeader>
							<PrintHeaderSubTitle>{HEADER_TITLE}</PrintHeaderSubTitle>
							<PrintHeaderTitle>{REPORT_KHMER_TITLE}</PrintHeaderTitle>
							<PrintHeaderPhone>{HEADER_PHONE}</PrintHeaderPhone>
						</PrintHeader>
					}
					metaColumns={metaColumns}
					columns={PREVIEW_COLUMNS}
					rows={reportRows}
					emptyText={emptyText}
					timestampText={timestampText}
					footerText={REPORT_FOOTER_TEXT}
				/>
			</PrintTableWrapper>
		</PageRoot>
	);
}

//#region Styled Components
const PageRoot = styled.div.attrs({
	className: "invoice-export-preview-page flex h-full flex-col overflow-auto p-1 print:block print:h-auto print:p-0",
})``;

const PrintHiddenSection = styled.div.attrs({
	className: "print:hidden",
})``;

const StyledReportToolbar = styled(ReportToolbar).attrs({
	className: "rounded-b-none border-b-0",
})``;

const PrintTableWrapper = styled.div.attrs<{ $paperSizeMode: PaperSizeMode }>(({ $paperSizeMode }) => ({
	className: getPaperSizeWrapperClassName($paperSizeMode),
}))``;

const StyledReportTemplateTable = styled(ReportTemplateTable).attrs<{ $templateMode: TemplateMode }>(
	({ $templateMode }) => ({
		className: getTemplateClassName($templateMode),
	}),
)``;

const PrintHeader = styled.div.attrs({
	className: "invoice-print-header flex flex-col items-center gap-1 text-center",
})``;

const PrintHeaderSubTitle = styled.div.attrs({
	className: "text-[10px] text-slate-500",
})``;

const PrintHeaderTitle = styled.div.attrs({
	className: "text-xl font-bold leading-none text-slate-700",
})``;

const PrintHeaderPhone = styled.div.attrs({
	className: "text-sm font-semibold text-slate-600 underline underline-offset-2",
})``;
//#endregion
