import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import invoiceService from "@/core/api/services/invoice-service";
import type { InvoiceExportPreviewLocationState } from "@/core/types/invoice";
import { cn } from "@/core/utils";

import { ReportTemplateTable } from "../../reports/components/layout/report-template-table";
import type { ReportSectionVisibility } from "../../reports/components/layout/report-toolbar";
import {
	DEFAULT_REPORT_SECTIONS,
	REPORT_DEFAULT_DATE,
	REPORT_FOOTER_TEXT,
	REPORT_TIMESTAMP_TEXT,
} from "../../reports/report-detail/constants";
import { EXPORT_PREVIEW_COLUMNS } from "./components/export-preview-columns";
import { ExportPreviewToolbar } from "./components/export-preview-toolbar";
import {
	getPaperSizeWrapperClassName,
	getTemplateClassName,
	type PaperSizeMode,
	type SortMode,
	type TemplateMode,
} from "./constants";
import {
	buildReportRows,
	calculateTotalBalance,
	mapExportLineToPreviewRow,
	sortPreviewRows,
} from "./utils/export-preview-rows";
import { buildInvoiceExportBlob } from "./utils/invoice-export-template";

export default function InvoiceExportPreviewPage() {
	const location = useLocation();
	const [isExporting, setIsExporting] = useState(false);
	const state = (location.state as InvoiceExportPreviewLocationState | null) ?? null;
	const selectedInvoiceIds = state?.selectedInvoiceIds ?? [];
	const fallbackRows = state?.previewRows ?? [];
	const exportQuery = useQuery({
		queryKey: ["invoice-export-lines", selectedInvoiceIds],
		queryFn: () => invoiceService.exportInvoice(selectedInvoiceIds),
		enabled: selectedInvoiceIds.length > 0,
	});

	const columns = EXPORT_PREVIEW_COLUMNS;
	const [showSections, setShowSections] = useState<ReportSectionVisibility>({
		...DEFAULT_REPORT_SECTIONS,
		filter: false,
	});
	const [templateMode, setTemplateMode] = useState<TemplateMode>("standard");
	const [paperSizeMode, setPaperSizeMode] = useState<PaperSizeMode>("a4");
	const [sortMode, setSortMode] = useState<SortMode>("default");
	const [hasAutoPrinted, setHasAutoPrinted] = useState(false);
	const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(columns.map((column) => [column.id, true])),
	);

	const previewRows = useMemo(
		() => (exportQuery.data?.length ? exportQuery.data.map(mapExportLineToPreviewRow) : fallbackRows),
		[exportQuery.data, fallbackRows],
	);

	const sortedPreviewRows = useMemo(() => sortPreviewRows(previewRows, sortMode), [previewRows, sortMode]);

	const hiddenColumnKeys = useMemo(
		() => columns.filter((column) => columnVisibility[column.id] === false).map((column) => column.id),
		[columnVisibility, columns],
	);

	const tableWrapperClassName = useMemo(() => getPaperSizeWrapperClassName(paperSizeMode), [paperSizeMode]);
	const tableClassName = useMemo(() => getTemplateClassName(templateMode), [templateMode]);

	const reportRows = useMemo(() => buildReportRows(sortedPreviewRows), [sortedPreviewRows]);

	const totalBalance = useMemo(() => calculateTotalBalance(previewRows), [previewRows]);

	const handleConfirmExport = async () => {
		if (selectedInvoiceIds.length === 0) {
			toast.error("Please select invoice(s) before exporting");
			return;
		}

		try {
			setIsExporting(true);
			const exportLines = exportQuery.data ?? (await exportQuery.refetch()).data ?? [];
			if (exportLines.length === 0) {
				toast.error("No invoice data available for export");
				return;
			}
			const blob = buildInvoiceExportBlob(exportLines);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `invoice-export-${Date.now()}.xlsx`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			window.URL.revokeObjectURL(url);
			toast.success("Invoice exported successfully");
		} catch {
			toast.error("Failed to export invoice");
		} finally {
			setIsExporting(false);
		}
	};

	const handlePrint = () => {
		window.print();
	};

	useEffect(() => {
		if (hasAutoPrinted || !state?.autoPrint) return;
		if (exportQuery.isLoading || previewRows.length === 0) return;
		setHasAutoPrinted(true);
		requestAnimationFrame(() => {
			window.print();
		});
	}, [hasAutoPrinted, state?.autoPrint, exportQuery.isLoading, previewRows.length]);

	return (
		<div className="invoice-export-preview-page flex h-full flex-col gap-4 p-2 print:p-0">
			<div className="flex flex-col">
				<div className="print:hidden">
					<ExportPreviewToolbar
						showSections={showSections}
						onShowSectionsChange={setShowSections}
						templateMode={templateMode}
						onTemplateModeChange={setTemplateMode}
						paperSizeMode={paperSizeMode}
						onPaperSizeModeChange={setPaperSizeMode}
						sortMode={sortMode}
						onSortModeChange={setSortMode}
						columns={columns}
						columnVisibility={columnVisibility}
						onColumnVisibilityChange={(columnId, checked) =>
							setColumnVisibility((prev) => ({ ...prev, [columnId]: checked }))
						}
						onExport={handleConfirmExport}
						onPrint={handlePrint}
						isExporting={isExporting}
						isExportDisabled={selectedInvoiceIds.length === 0 || isExporting || exportQuery.isLoading}
					/>
				</div>

				<div className={cn("invoice-export-preview-template w-full", tableWrapperClassName)}>
					<ReportTemplateTable
						className={tableClassName}
						showSections={showSections}
						title="INVOICE EXPORT PREVIEW"
						subtitle={REPORT_DEFAULT_DATE}
						columns={columns}
						hiddenColumnKeys={hiddenColumnKeys}
						rows={reportRows}
						summaryRows={[
							{ key: "total-customer", label: "Total Customer: ", value: String(selectedInvoiceIds.length) },
							{ key: "total-balance", label: "Total Balance: ", value: `${totalBalance.toLocaleString()} ៛` },
						]}
						timestampText={REPORT_TIMESTAMP_TEXT}
						footerText={REPORT_FOOTER_TEXT}
					/>
				</div>
			</div>
		</div>
	);
}
