import { useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { useMemo, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import invoiceService from "@/core/api/services/invoice-service";
import Icon from "@/core/components/icon/icon";
import type {
	InvoiceExportLineResult,
	InvoiceExportPreviewLocationState,
	InvoiceExportPreviewRow,
} from "@/core/types/invoice";
import { Button } from "@/core/ui/button";

import { type ReportTemplateColumn, ReportTemplateTable } from "../../reports/components/layout/report-template-table";
import { type ReportSectionVisibility, ReportToolbar } from "../../reports/components/layout/report-toolbar";
import {
	DEFAULT_REPORT_SECTIONS,
	REPORT_DEFAULT_DATE,
	REPORT_FOOTER_TEXT,
	REPORT_TIMESTAMP_TEXT,
} from "../../reports/report-detail/constants";
import { buildInvoiceExportBlob } from "./utils/invoice-export-template";

const EMPTY_CELL = "-";
const toolbarButtonClassName = "h-8 gap-1.5 px-2 text-sky-600 hover:bg-sky-50";

function formatNumber(value: number | null): string {
	if (value === null) return EMPTY_CELL;
	return value.toLocaleString();
}

function formatReportDate(value: string): string {
	const parsed = parseISO(value);
	if (!isValid(parsed)) return value;
	return format(parsed, "dd/MM/yyyy");
}

function resolveOriginalAmount(row: InvoiceExportPreviewRow): number | null {
	return (
		row.amount ??
		row.total ??
		(row.pricePerProduct !== null && row.quantity !== null ? row.pricePerProduct * row.quantity : null)
	);
}

function resolveBalance(row: InvoiceExportPreviewRow, originalAmount: number | null): number | null {
	if (row.balance !== null) return row.balance;
	if (originalAmount === null) return null;
	return Math.max(0, originalAmount - (row.paid ?? 0));
}

function mapExportLineToPreviewRow(line: InvoiceExportLineResult): InvoiceExportPreviewRow {
	return {
		refNo: line.refNo ?? "",
		customerName: line.customerName ?? "-",
		date: line.date ?? "",
		productName: line.productName ?? null,
		unit: line.unit ?? null,
		pricePerProduct: line.pricePerProduct ?? null,
		quantityPerProduct: line.quantityPerProduct ?? null,
		quantity: line.quantity ?? null,
		amount: line.amount ?? null,
		total: line.total ?? null,
		memo: line.memo ?? null,
		paid: line.paid ?? null,
		balance: line.balance ?? null,
	};
}

export default function InvoiceExportPreviewPage() {
	const location = useLocation();
	const [isExporting, setIsExporting] = useState(false);
	const state = (location.state as InvoiceExportPreviewLocationState | null) ?? null;
	const selectedInvoiceIds = state?.selectedInvoiceIds ?? [];
	const fallbackRows = state?.previewRows ?? [];
	const showSections: ReportSectionVisibility = DEFAULT_REPORT_SECTIONS;
	const exportQuery = useQuery({
		queryKey: ["invoice-export-lines", selectedInvoiceIds],
		queryFn: () => invoiceService.exportInvoice(selectedInvoiceIds),
		enabled: selectedInvoiceIds.length > 0,
	});

	const columns: ReportTemplateColumn[] = useMemo(
		() => [
			{ key: "no", label: "NO" },
			{ key: "refNo", label: "REF NO", align: "left" },
			{ key: "customer", label: "CUSTOMER", align: "left" },
			{ key: "date", label: "DATE" },
			{ key: "productName", label: "PRODUCT NAME", align: "left" },
			{ key: "unit", label: "UNIT" },
			{ key: "price", label: "PRICE", align: "right" },
			{ key: "quantity", label: "QTY", align: "right" },
			{ key: "amount", label: "AMOUNT", align: "right" },
			{ key: "total", label: "TOTAL", align: "right" },
			{ key: "received", label: "RECEIVED", align: "right" },
			{ key: "balance", label: "BALANCE", align: "right" },
			{ key: "memo", label: "MEMO", align: "left" },
		],
		[],
	);

	const previewRows = useMemo(
		() => (exportQuery.data?.length ? exportQuery.data.map(mapExportLineToPreviewRow) : fallbackRows),
		[exportQuery.data, fallbackRows],
	);

	const reportRows = useMemo(() => {
		return previewRows.map((row, index) => {
			const originalAmount = resolveOriginalAmount(row);
			const received = row.paid;
			const balance = resolveBalance(row, originalAmount);

			return {
				key: `${row.refNo}-${row.productName ?? "no-item"}-${index}`,
				cells: {
					no: index + 1,
					customer: row.customerName,
					date: formatReportDate(row.date),
					refNo: row.refNo,
					productName: row.productName ?? EMPTY_CELL,
					unit: row.unit ?? EMPTY_CELL,
					price: formatNumber(row.pricePerProduct),
					quantity: formatNumber(row.quantity),
					amount: formatNumber(row.amount),
					total: formatNumber(row.total),
					memo: row.memo ?? EMPTY_CELL,
					received: formatNumber(received),
					balance: formatNumber(balance),
				},
			};
		});
	}, [previewRows]);

	const totalBalance = useMemo(() => {
		return previewRows.reduce((sum, row) => {
			const originalAmount = resolveOriginalAmount(row);
			const nextBalance = resolveBalance(row, originalAmount) ?? 0;
			return sum + nextBalance;
		}, 0);
	}, [previewRows]);

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

	return (
		<div className="flex h-full flex-col gap-4 p-2">
			<div className="flex flex-col">
				<ReportToolbar
					className="rounded-b-none border-b-0"
					showSections={showSections}
					rightActions={
						<div className="flex items-center gap-2">
							<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
								<Icon icon="mdi:cog-outline" size="1.2em" />
								<span className="text-xs font-medium">Customize</span>
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className={toolbarButtonClassName}
								onClick={handleConfirmExport}
								disabled={selectedInvoiceIds.length === 0 || isExporting || exportQuery.isLoading}
							>
								<Icon icon="mdi:file-excel-outline" size="1.2em" />
								<span className="text-xs font-medium">{isExporting ? "Exporting..." : "Export Excel"}</span>
							</Button>
							<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
								<Icon icon="mdi:printer-outline" size="1.2em" />
								<span className="text-xs font-medium">Print</span>
							</Button>
							<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
								<Icon icon="mdi:content-copy" size="1.2em" />
								<span className="text-xs font-medium">Copy</span>
							</Button>
						</div>
					}
				/>

				<ReportTemplateTable
					className="rounded-t-none gap-6 p-6"
					showSections={showSections}
					title="INVOICE EXPORT PREVIEW"
					subtitle={REPORT_DEFAULT_DATE}
					columns={columns}
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
	);
}
