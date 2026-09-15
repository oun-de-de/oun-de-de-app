import type { Invoice, InvoiceExportLineApi, InvoiceExportPreviewRow, PaymentResult } from "@/core/types/invoice";
import {
	buildReportRowsFromExportLines,
	getPreviewRowOriginalAmount,
	toInvoiceExportPreviewRow,
} from "../../../../invoice/export-preview/utils/export-preview-rows";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";

const PREMIUM_PRODUCT_KEYWORDS = ["premium", "solid ice", "អនាម័យ"] as const;
const ICE_CUBE_KEYWORDS = ["cube", "ដើម"] as const;
export function mapExportLinesToPreviewRows(exportLines: InvoiceExportLineApi[]): InvoiceExportPreviewRow[] {
	// Reuse the invoice preview row shape so report/export logic works from one normalized source.
	return exportLines.map(toInvoiceExportPreviewRow);
}

export function buildInvoiceReportRows(exportLines: InvoiceExportLineApi[]): ReportTemplateRow[] {
	return buildReportRowsFromExportLines(exportLines);
}

export function groupPreviewRowsByRefNo(
	previewRows: InvoiceExportPreviewRow[],
): Map<string, InvoiceExportPreviewRow[]> {
	const previewByRefNo = new Map<string, InvoiceExportPreviewRow[]>();

	for (const previewRow of previewRows) {
		const key = previewRow.refNo || "";
		const current = previewByRefNo.get(key) ?? [];
		current.push(previewRow);
		previewByRefNo.set(key, current);
	}

	return previewByRefNo;
}

export function getNotificationText(amount: number): string {
	if (amount >= 2_000_000) return "Truck credit limit alert";
	if (amount >= 1_000_000) return "Tuk-tuk credit limit alert";
	return "-";
}

export function sumOriginalAmount(rows: InvoiceExportPreviewRow[]): number {
	return rows.reduce((sum, row) => sum + (getPreviewRowOriginalAmount(row) ?? 0), 0);
}

const EMPTY_RECEIVED_BY_CYCLE: ReadonlyMap<string, number> = new Map();

export function getOpenInvoiceMetrics(
	invoice: Pick<Invoice, "refNo" | "amount">,
	rowsByRefNo: Map<string, InvoiceExportPreviewRow[]>,
	receivedByCycle: ReadonlyMap<string, number> = EMPTY_RECEIVED_BY_CYCLE,
) {
	// originalAmount still comes from preview rows (export lines) — the invoice-export endpoint is the
	// only source for per-product amounts. `paid`/`balance` on those lines are always null (BE gap,
	// 2026-08-31 audit): "received" instead comes from real /payments, matched by cycleId — payments
	// have no invoiceId (verified against live OpenAPI spec, 2026-09-15), so this is the finest
	// granularity available. Multiple invoices sharing one cycle will show the same received amount.
	const rows = rowsByRefNo.get(invoice.refNo ?? "") ?? [];
	const originalAmount = invoice.amount ?? sumOriginalAmount(rows);
	const cycleId = rows[0]?.cycleId ?? null;
	const received = cycleId ? (receivedByCycle.get(cycleId) ?? 0) : 0;
	const balance = Math.max(originalAmount - received, 0);

	return { originalAmount, received, balance, cycleId };
}

export function sumPaymentsByCycle(payments: PaymentResult[]): Map<string, number> {
	const receivedByCycle = new Map<string, number>();
	for (const payment of payments) {
		const amount = payment.amount ?? 0;
		if (amount <= 0 || !payment.cycleId) continue;
		receivedByCycle.set(payment.cycleId, (receivedByCycle.get(payment.cycleId) ?? 0) + amount);
	}
	return receivedByCycle;
}

function normalizeText(value: string | null | undefined): string {
	return (value ?? "").trim().toLowerCase();
}

function includesAnyKeyword(value: string, keywords: readonly string[]) {
	return keywords.some((keyword) => value.includes(keyword));
}

export function isReceiptInvoice(invoice: Pick<Invoice, "refNo" | "type">): boolean {
	const normalizedType = normalizeText(invoice.type);
	if (normalizedType === "receipt") return true;

	const normalizedRefNo = normalizeText(invoice.refNo);
	return normalizedRefNo.startsWith("rec") || normalizedRefNo.startsWith("rcp") || normalizedRefNo.startsWith("rc");
}

export function getCustomerSaleType(
	invoice: Pick<Invoice, "refNo" | "type" | "paymentTerm">,
): "cash_sale" | "invoice" | "receipt" {
	if (isReceiptInvoice(invoice)) return "receipt";
	const normalizedType = normalizeText(invoice.type);
	if (normalizedType === "invoice") return "invoice";
	if (normalizedType === "cash_sale" || normalizedType === "cash sale") return "cash_sale";

	const normalizedRefNo = normalizeText(invoice.refNo);
	if (normalizedRefNo.startsWith("in")) return "invoice";
	if (normalizedRefNo.startsWith("cs")) return "cash_sale";

	return invoice.paymentTerm ? "invoice" : "cash_sale";
}

export function getProductCategory(productName: string | null | undefined): string {
	const normalized = normalizeText(productName);
	if (includesAnyKeyword(normalized, PREMIUM_PRODUCT_KEYWORDS)) return "Premium Ice";
	if (includesAnyKeyword(normalized, ICE_CUBE_KEYWORDS)) return "Ice Cube";
	return "General";
}

export function buildInvoiceTypeMap(invoices: Invoice[]): Map<string, "cash_sale" | "invoice" | "receipt"> {
	return new Map(invoices.map((invoice) => [invoice.refNo ?? "", getCustomerSaleType(invoice)]));
}

export function splitPreviewRowsIntoCashAndCredit(invoices: Invoice[], previewRows: InvoiceExportPreviewRow[]) {
	const typeByRefNo = buildInvoiceTypeMap(invoices);
	return previewRows.reduce<{ cashRows: InvoiceExportPreviewRow[]; creditRows: InvoiceExportPreviewRow[] }>(
		(acc, row) => {
			if (typeByRefNo.get(row.refNo) === "invoice") {
				acc.creditRows.push(row);
			} else {
				acc.cashRows.push(row);
			}
			return acc;
		},
		{ cashRows: [], creditRows: [] },
	);
}
