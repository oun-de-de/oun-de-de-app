import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import PremiumIceLogo from "@/assets/icons/ic-premium-ice.png";
import invoiceService from "@/core/api/services/invoice-service";
import { BackButton } from "@/core/components/common";
import { useAuthUser } from "@/core/services/auth/hooks/use-auth";
import type { InvoiceExportPreviewLocationState, InvoiceExportPreviewRow } from "@/core/types/invoice";
import { cn } from "@/core/utils";
import {
	type ReportTemplateMetaColumn,
	ReportTemplateTable,
} from "../../reports/components/layout/report-template-table";
import type { ReportSectionVisibility } from "../../reports/components/layout/report-toolbar";
import {
	DEFAULT_REPORT_SECTIONS,
	formatReportTimestamp,
	REPORT_DEFAULT_DATE,
	REPORT_FOOTER_TEXT,
	REPORT_KHMER_TITLE,
} from "../../reports/report-detail/constants";
import { formatNumber } from "../utils/formatters";
import { EXPORT_PREVIEW_COLUMNS } from "./components/export-preview-columns";
import { ExportPreviewToolbar } from "./components/export-preview-toolbar";
import {
	getPaperSizePageValue,
	getPaperSizeWrapperClassName,
	getTemplateClassName,
	type OrientationMode,
	type PaperSizeMode,
	type SortMode,
	type TemplateMode,
} from "./constants";
import {
	buildReportRows,
	calculateTotalBalance,
	calculateTotalReceived,
	toInvoiceExportPreviewRow,
	sortPreviewRows,
} from "./utils/export-preview-rows";
import { buildInvoiceExportBlob } from "./utils/invoice-export-template";

function parseInvoiceIds(value: string | null) {
	if (!value) return [];

	return value
		.split(",")
		.map((id) => id.trim())
		.filter(Boolean);
}

function buildClipboardText(
	rows: ReturnType<typeof buildReportRows>,
	visibleColumnIds: string[],
	columns = EXPORT_PREVIEW_COLUMNS,
) {
	const visibleColumns = columns.filter((column) => visibleColumnIds.includes(column.id));
	const headerRow = visibleColumns.map((column) => (typeof column.header === "string" ? column.header : column.id));
	const bodyRows = rows.map((row) =>
		visibleColumns.map((column) => {
			const cellValue = row.cells[column.id];
			return typeof cellValue === "string" || typeof cellValue === "number" ? String(cellValue) : "";
		}),
	);

	return [headerRow, ...bodyRows].map((cells) => cells.join("\t")).join("\n");
}

function getRowQuantity(row: InvoiceExportPreviewRow) {
	return row.quantity ?? row.quantityPerProduct ?? 0;
}

function getRowPrice(row: InvoiceExportPreviewRow) {
	return row.pricePerProduct ?? 0;
}

function getRowAmount(row: InvoiceExportPreviewRow) {
	return row.amount ?? row.total ?? 0;
}

function formatPreviewTimestamp(value?: string | null, fallback = REPORT_DEFAULT_DATE) {
	if (!value) return fallback;
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return fallback;

	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	}).format(parsed);
}

export default function InvoiceExportPreviewPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const authUser = useAuthUser();
	const [isExporting, setIsExporting] = useState(false);
	const state = (location.state as InvoiceExportPreviewLocationState | null) ?? null;
	const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const autoPrintStorageKey = useMemo(() => `invoice-export-auto-print:${location.key}`, [location.key]);
	const requestedPaperSizeMode = searchParams.get("paper");
	const requestedOrientationMode = searchParams.get("orientation");
	const requestedTemplateMode = searchParams.get("template");
	const requestedSortMode = searchParams.get("sort");
	const initialPaperSizeMode =
		requestedPaperSizeMode === "a5" || requestedPaperSizeMode === "a4" || requestedPaperSizeMode === "letter"
			? requestedPaperSizeMode
			: state?.initialPaperSizeMode;
	const initialOrientationMode =
		requestedOrientationMode === "portrait" || requestedOrientationMode === "landscape"
			? requestedOrientationMode
			: (state?.initialOrientationMode ?? "portrait");
	const initialTemplateMode =
		requestedTemplateMode === "standard" || requestedTemplateMode === "compact" || requestedTemplateMode === "detailed"
			? requestedTemplateMode
			: "standard";
	const initialSortMode =
		requestedSortMode === "default" ||
		requestedSortMode === "date-desc" ||
		requestedSortMode === "date-asc" ||
		requestedSortMode === "customer-asc" ||
		requestedSortMode === "balance-desc"
			? requestedSortMode
			: "default";
	const selectedInvoiceIds = useMemo(() => {
		if (state?.selectedInvoiceIds?.length) return state.selectedInvoiceIds.filter(Boolean);

		const idsFromSearch = parseInvoiceIds(searchParams.get("ids"));
		if (idsFromSearch.length > 0) return idsFromSearch;

		return [];
	}, [state?.selectedInvoiceIds, searchParams]);
	const fallbackRows = state?.previewRows ?? [];
	const exportQuery = useQuery({
		queryKey: ["invoice-export-lines", selectedInvoiceIds],
		queryFn: () => invoiceService.listInvoiceDetails(selectedInvoiceIds),
		enabled: selectedInvoiceIds.length > 0,
	});

	const columns = EXPORT_PREVIEW_COLUMNS;
	const [showSections, setShowSections] = useState<ReportSectionVisibility>({
		...DEFAULT_REPORT_SECTIONS,
		filter: false,
	});
	const [templateMode, setTemplateMode] = useState<TemplateMode>(initialTemplateMode);
	const [paperSizeMode, setPaperSizeMode] = useState<PaperSizeMode>(initialPaperSizeMode ?? "a4");
	const [orientationMode, setOrientationMode] = useState<OrientationMode>(initialOrientationMode);
	const [sortMode, setSortMode] = useState<SortMode>(initialSortMode);
	const [hasAutoPrinted, setHasAutoPrinted] = useState(false);
	const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(columns.map((column) => [column.id, true])),
	);

	const previewRows = useMemo(
		() => (exportQuery.data?.length ? exportQuery.data.map(toInvoiceExportPreviewRow) : fallbackRows),
		[exportQuery.data, fallbackRows],
	);

	const sortedPreviewRows = useMemo(() => sortPreviewRows(previewRows, sortMode), [previewRows, sortMode]);

	const hiddenColumnKeys = useMemo(
		() => columns.filter((column) => columnVisibility[column.id] === false).map((column) => column.id),
		[columnVisibility, columns],
	);
	const visibleColumnIds = useMemo(
		() => columns.filter((column) => columnVisibility[column.id] !== false).map((column) => column.id),
		[columnVisibility, columns],
	);

	const tableWrapperClassName = useMemo(
		() => getPaperSizeWrapperClassName(paperSizeMode, orientationMode),
		[paperSizeMode, orientationMode],
	);
	const pageSizeValue = useMemo(() => getPaperSizePageValue(paperSizeMode), [paperSizeMode]);
	const tableClassName = useMemo(() => getTemplateClassName(templateMode), [templateMode]);
	const isA5Layout = paperSizeMode === "a5" && orientationMode === "landscape";

	const reportRows = useMemo(() => buildReportRows(sortedPreviewRows), [sortedPreviewRows]);
	const reportDate = useMemo(
		() => formatPreviewTimestamp(sortedPreviewRows[0]?.date, REPORT_DEFAULT_DATE),
		[sortedPreviewRows],
	);
	const customerSummaryText = useMemo(() => {
		const uniqueCustomerNames = [...new Set(sortedPreviewRows.map((row) => row.customerName).filter(Boolean))];
		if (uniqueCustomerNames.length === 1) {
			return `Customer: ${uniqueCustomerNames[0]}`;
		}
		if (uniqueCustomerNames.length > 1) {
			return `Customers: ${uniqueCustomerNames.length}`;
		}
		return "Customer: -";
	}, [sortedPreviewRows]);
	const invoiceSummaryText = useMemo(() => {
		const uniqueRefNos = [...new Set(sortedPreviewRows.map((row) => row.refNo).filter(Boolean))];
		if (uniqueRefNos.length === 1) {
			return `Invoice No: ${uniqueRefNos[0]}`;
		}
		return `Total Invoices: ${uniqueRefNos.length}`;
	}, [sortedPreviewRows]);
	const metaColumns = useMemo<ReportTemplateMetaColumn[]>(
		() => [
			{
				key: "left-meta",
				rows: [invoiceSummaryText, customerSummaryText],
				align: "left",
			},
			{
				key: "center-meta",
				rows: [""],
				align: "center",
			},
			{
				key: "right-meta",
				rows: [`Date: ${reportDate}`],
				align: "right",
			},
		],
		[customerSummaryText, invoiceSummaryText, reportDate],
	);

	const totalBalance = useMemo(() => calculateTotalBalance(previewRows), [previewRows]);
	const totalReceived = useMemo(() => calculateTotalReceived(previewRows), [previewRows]);
	const totalQuantity = useMemo(
		() => sortedPreviewRows.reduce((sum, row) => sum + getRowQuantity(row), 0),
		[sortedPreviewRows],
	);
	const totalAmount = useMemo(
		() => sortedPreviewRows.reduce((sum, row) => sum + getRowAmount(row), 0),
		[sortedPreviewRows],
	);
	const timestampText = useMemo(() => {
		const employeeName = authUser?.data?.username || "Unknown";
		return formatReportTimestamp(employeeName, new Date());
	}, [authUser]);

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

	const handlePrint = useCallback(() => {
		window.print();
	}, []);

	const handleBack = useCallback(() => {
		const cycleId = searchParams.get("cycleId") ?? state?.cycleId;
		const customerId = searchParams.get("customerId") ?? state?.customerId;
		const customerName = searchParams.get("customerName") ?? state?.customerName;

		if (cycleId) {
			const params = new URLSearchParams();
			if (customerId) params.set("customerId", customerId);
			if (customerName) params.set("customerName", customerName);
			params.set("cycleId", cycleId);
			navigate(`/dashboard/invoice?${params.toString()}`);
			return;
		}

		navigate("/dashboard/invoice");
	}, [navigate, searchParams, state]);

	const handleCopy = useCallback(async () => {
		const clipboardText = buildClipboardText(reportRows, visibleColumnIds, columns);

		try {
			await navigator.clipboard.writeText(clipboardText);
			toast.success("Copied current table to clipboard");
		} catch {
			toast.error("Failed to copy table data");
		}
	}, [columns, reportRows, visibleColumnIds]);

	useEffect(() => {
		const nextSearchParams = new URLSearchParams(location.search);
		const idsValue = selectedInvoiceIds.join(",");
		if (idsValue) nextSearchParams.set("ids", idsValue);
		else nextSearchParams.delete("ids");
		const cycleId = state?.cycleId ?? searchParams.get("cycleId");
		const customerId = state?.customerId ?? searchParams.get("customerId");
		const customerName = state?.customerName ?? searchParams.get("customerName");
		if (cycleId) nextSearchParams.set("cycleId", cycleId);
		else nextSearchParams.delete("cycleId");
		if (customerId) nextSearchParams.set("customerId", customerId);
		else nextSearchParams.delete("customerId");
		if (customerName) nextSearchParams.set("customerName", customerName);
		else nextSearchParams.delete("customerName");
		nextSearchParams.set("paper", paperSizeMode);
		nextSearchParams.set("orientation", orientationMode);
		nextSearchParams.set("template", templateMode);
		nextSearchParams.set("sort", sortMode);

		const nextSearch = nextSearchParams.toString();
		const currentSearch = location.search.startsWith("?") ? location.search.slice(1) : location.search;
		if (nextSearch === currentSearch) return;

		navigate(`${location.pathname}?${nextSearch}`, {
			replace: true,
			state,
		});
	}, [
		location.pathname,
		location.search,
		navigate,
		orientationMode,
		paperSizeMode,
		selectedInvoiceIds,
		searchParams,
		sortMode,
		state,
		templateMode,
	]);

	useEffect(() => {
		if (hasAutoPrinted || !state?.autoPrint) return;
		if (exportQuery.isLoading || previewRows.length === 0) return;
		if (window.sessionStorage.getItem(autoPrintStorageKey) === "done") return;

		window.sessionStorage.setItem(autoPrintStorageKey, "done");
		setHasAutoPrinted(true);
		const timer = window.setTimeout(() => {
			handlePrint();
		}, 120);

		return () => {
			window.clearTimeout(timer);
		};
	}, [autoPrintStorageKey, hasAutoPrinted, state?.autoPrint, exportQuery.isLoading, previewRows.length, handlePrint]);

	useEffect(() => {
		const styleId = "invoice-export-page-size-style";
		let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = styleId;
			document.head.appendChild(styleEl);
		}
		styleEl.textContent = `
			@media print {
				@page { size: ${pageSizeValue} ${orientationMode}; margin: 6mm; }
				html, body, #root {
					height: auto !important;
					min-height: 0 !important;
					overflow: visible !important;
				}
				[data-slot="slash-layout-main"],
				[data-slot="slash-layout-root"] {
					height: auto !important;
					min-height: 0 !important;
					max-height: none !important;
					overflow: visible !important;
					padding: 0 !important;
					margin: 0 !important;
				}
				.invoice-export-preview-page,
				.invoice-export-preview-template,
				.invoice-export-print-target {
					height: auto !important;
					min-height: 0 !important;
					max-height: none !important;
					overflow: visible !important;
				}
				.invoice-export-preview-page {
					display: block !important;
					padding: 0 !important;
					margin: 0 !important;
				}
				.invoice-export-preview-template {
					width: auto !important;
					max-width: none !important;
					break-inside: avoid-page;
					page-break-inside: avoid;
				}
				.invoice-export-print-target {
					box-shadow: none !important;
					break-inside: avoid-page;
					page-break-inside: avoid;
				}
			}
		`;

		return () => {
			styleEl?.remove();
		};
	}, [pageSizeValue, orientationMode]);

	return (
		<div className="invoice-export-preview-page flex h-full flex-col gap-4 p-1 overflow-auto print:block print:h-auto print:p-0">
			<div className="print:hidden">
				<BackButton onClick={handleBack} />
			</div>

			<div className="flex flex-col print:block">
				<div className="print:hidden">
					<ExportPreviewToolbar
						showSections={showSections}
						onShowSectionsChange={setShowSections}
						templateMode={templateMode}
						onTemplateModeChange={setTemplateMode}
						paperSizeMode={paperSizeMode}
						onPaperSizeModeChange={setPaperSizeMode}
						orientationMode={orientationMode}
						onOrientationModeChange={setOrientationMode}
						sortMode={sortMode}
						onSortModeChange={setSortMode}
						columns={columns}
						columnVisibility={columnVisibility}
						onColumnVisibilityChange={(columnId, checked) =>
							setColumnVisibility((prev) => ({ ...prev, [columnId]: checked }))
						}
						onExport={handleConfirmExport}
						onPrint={handlePrint}
						onCopy={handleCopy}
						isExporting={isExporting}
						isExportDisabled={selectedInvoiceIds.length === 0 || isExporting || exportQuery.isLoading}
					/>
				</div>

				<div className={cn("invoice-export-preview-template w-full print:w-auto", tableWrapperClassName)}>
					{isA5Layout ? (
						<div className="invoice-export-print-target invoice-print-sheet bg-white px-5 py-4 text-black">
							<div className="mb-3 flex items-start gap-4">
								<div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-sky-500 bg-white">
									<img
										src={PremiumIceLogo}
										alt="Premium Ice Logo"
										width={80}
										height={80}
										className="size-full object-cover"
									/>
								</div>
								<div className="flex-1 text-center">
									<div className="text-[24px] font-black leading-tight">{REPORT_KHMER_TITLE}</div>
									<div className="mt-2 text-[13px] font-semibold text-slate-700">
										ទីតាំង : ភូមិត្រពាំងក្រសាំង សង្កាត់កន្ទោក ខណ្ឌកំបូល រាជធានីភ្នំពេញ (TEL: 070 66 9898)
									</div>
								</div>
							</div>

							<div className="mb-2 border-t border-slate-500 pt-2 text-[14px] font-bold">
								<div className="flex items-center justify-between gap-4">
									<div>Customer : {sortedPreviewRows[0]?.customerName || "-"}</div>
									<div>Ref No : {sortedPreviewRows[0]?.refNo || "-"}</div>
								</div>
								<div className="mt-1 flex items-center justify-between gap-4">
									<div>Phone :</div>
									<div>Date : {reportDate}</div>
								</div>
							</div>

							<table className="w-full border-collapse text-[13px]">
								<thead>
									<tr>
										<th className="border border-slate-500 px-2 py-1.5 text-center font-bold">ល.រ</th>
										<th className="border border-slate-500 px-2 py-1.5 text-center font-bold">PRODUCT</th>
										<th className="border border-slate-500 px-2 py-1.5 text-center font-bold">UNIT</th>
										<th className="border border-slate-500 px-2 py-1.5 text-center font-bold">QTY</th>
										<th className="border border-slate-500 px-2 py-1.5 text-center font-bold">PRICE</th>
										<th className="border border-slate-500 px-2 py-1.5 text-center font-bold">DISCOUNT</th>
										<th className="border border-slate-500 px-2 py-1.5 text-center font-bold">TOTAL</th>
									</tr>
								</thead>
								<tbody>
									{sortedPreviewRows.map((row, index) => (
										<tr key={`${row.refNo}-${index}`}>
											<td className="border border-slate-500 px-2 py-2 text-center">{index + 1}</td>
											<td className="border border-slate-500 px-2 py-2 text-center">{row.productName || "-"}</td>
											<td className="border border-slate-500 px-2 py-2 text-center">{row.unit || "-"}</td>
											<td className="border border-slate-500 px-2 py-2 text-center">
												{formatNumber(getRowQuantity(row))}
											</td>
											<td className="border border-slate-500 px-2 py-2 text-right">
												{formatNumber(getRowPrice(row))} ៛
											</td>
											<td className="border border-slate-500 px-2 py-2 text-center">0</td>
											<td className="border border-slate-500 px-2 py-2 text-right">
												{formatNumber(getRowAmount(row))} ៛
											</td>
										</tr>
									))}
									{Array.from({ length: Math.max(0, 1 - sortedPreviewRows.length) }).map((_, index) => (
										<tr key={`blank-${index}`}>
											<td className="border border-slate-500 px-2 py-3" />
											<td className="border border-slate-500 px-2 py-3" />
											<td className="border border-slate-500 px-2 py-3" />
											<td className="border border-slate-500 px-2 py-3" />
											<td className="border border-slate-500 px-2 py-3" />
											<td className="border border-slate-500 px-2 py-3" />
											<td className="border border-slate-500 px-2 py-3" />
										</tr>
									))}
								</tbody>
							</table>

							<div className="mt-2 flex justify-end">
								<div className="w-[240px] space-y-0.5 text-[14px] font-bold">
									<div className="flex justify-between">
										<span>Total Qty:</span>
										<span>{formatNumber(totalQuantity)}</span>
									</div>
									<div className="flex justify-between">
										<span>Received:</span>
										<span>{formatNumber(totalReceived)}៛</span>
									</div>
									<div className="flex justify-between">
										<span>Total Balance:</span>
										<span>{formatNumber(totalBalance)}៛</span>
									</div>
									<div className="flex justify-between">
										<span>Total:</span>
										<span>{formatNumber(totalAmount)}៛</span>
									</div>
								</div>
							</div>

							<div className="mt-8 grid grid-cols-3 text-center text-[15px] font-bold">
								<div>Receiver</div>
								<div>Customer</div>
								<div>Seller</div>
							</div>
						</div>
					) : (
						<ReportTemplateTable
							className={cn("invoice-export-print-target invoice-print-sheet", tableClassName)}
							showSections={showSections}
							title="Open Invoice On Period By Group"
							subtitle={reportDate}
							headerContent={
								<div className="invoice-print-header flex flex-col items-center gap-1 text-center">
									<div className="text-[10px] text-slate-500">Open Invoice On Period By Group</div>
									<div className="text-xl font-bold leading-none text-slate-700">{REPORT_KHMER_TITLE}</div>
									<div className="text-sm font-semibold text-slate-600 underline underline-offset-2">
										TEL: 070669898
									</div>
								</div>
							}
							metaColumns={metaColumns}
							columns={columns}
							hiddenColumnKeys={hiddenColumnKeys}
							rows={reportRows}
							summaryRows={[
								{ key: "received", label: "Received: ", value: `${formatNumber(totalReceived)} ៛` },
								{ key: "total-balance", label: "Total Balance: ", value: `${formatNumber(totalBalance)} ៛` },
							]}
							timestampText={timestampText}
							footerText={REPORT_FOOTER_TEXT}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
