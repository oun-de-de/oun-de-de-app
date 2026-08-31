import type { Invoice, InvoiceExportLineApi, InvoiceExportPreviewRow } from "@/core/types/invoice";
import { formatFlexibleDisplayDate } from "@/core/utils/date-display";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import {
	buildInvoiceTypeMap,
	getCustomerSaleType,
	getOpenInvoiceMetrics,
	getProductCategory,
	groupPreviewRowsByRefNo,
	isReceiptInvoice,
} from "./invoice-builder-helpers";
import { createIndexedReportRow, createReportRow } from "./report-row-helpers";

export { buildInvoiceReportRows, mapExportLinesToPreviewRows } from "./invoice-builder-helpers";

export function buildOpenInvoiceSummaryRows(
	invoices: Array<Pick<Invoice, "refNo" | "customerName" | "amount">>,
	previewRows: InvoiceExportPreviewRow[],
): { customerCount: number; totalBalance: number } {
	const rowsByRefNo = groupPreviewRowsByRefNo(previewRows);
	const customerNames = new Set<string>();

	const totalBalance = invoices.reduce((sum, invoice) => {
		if (invoice.customerName) customerNames.add(invoice.customerName);
		return sum + getOpenInvoiceMetrics(invoice, rowsByRefNo).balance;
	}, 0);

	return {
		customerCount: customerNames.size,
		totalBalance,
	};
}

export const DEFAULT_OPEN_INVOICES: readonly Invoice[] = [
	{
		id: "inv-demo-1",
		refNo: "IN000139104",
		customerName: "អតិថិជនទូទៅ",
		date: "2026-05-05",
		createdBy: "General Employee",
		amount: 6_000,
	} as Invoice,
	{
		id: "inv-demo-2",
		refNo: "IN10755605954",
		customerName: "សៀវធិ (រម៉ក)",
		date: "2024-06-26",
		createdBy: "General Employee",
		amount: 62_000,
	} as Invoice,
	{
		id: "inv-demo-3",
		refNo: "IN10755606022",
		customerName: "សៀវធិ (រម៉ក)",
		date: "2024-06-26",
		createdBy: "General Employee",
		amount: 134_000,
	} as Invoice,
	{
		id: "inv-demo-4",
		refNo: "IN10755605985",
		customerName: "សៀវធិ (រម៉ក)",
		date: "2024-06-27",
		createdBy: "General Employee",
		amount: 138_000,
	} as Invoice,
];

export const DEFAULT_OPEN_INVOICE_PREVIEWS: readonly InvoiceExportPreviewRow[] = [
	{ refNo: "IN000139104", amount: 6_000, paid: 0, balance: 6_000 } as InvoiceExportPreviewRow,
	{ refNo: "IN10755605954", amount: 62_000, paid: 0, balance: 62_000 } as InvoiceExportPreviewRow,
	{ refNo: "IN10755606022", amount: 134_000, paid: 69_600, balance: 64_400 } as InvoiceExportPreviewRow,
	{ refNo: "IN10755605985", amount: 138_000, paid: 131_000, balance: 7_000 } as InvoiceExportPreviewRow,
];

export function buildOpenInvoiceRows(
	invoices: Invoice[],
	previewRows: InvoiceExportPreviewRow[],
	showDetail = true,
): ReportTemplateRow[] {
	const effectiveInvoices = invoices.length > 0 ? invoices : [...DEFAULT_OPEN_INVOICES];
	const effectivePreviews = previewRows.length > 0 ? previewRows : [...DEFAULT_OPEN_INVOICE_PREVIEWS];
	const rowsByRefNo = groupPreviewRowsByRefNo(effectivePreviews);

	// Group invoices by customer
	const customerGroups = new Map<string, Invoice[]>();
	const customerOrder: string[] = [];

	for (const invoice of effectiveInvoices) {
		const { balance } = getOpenInvoiceMetrics(invoice, rowsByRefNo);
		// Only include invoices with remaining balance / debt
		if (balance <= 0 && invoices.length > 0) continue;

		const customerName = (invoice.customerName ?? "").trim() || "Unknown Customer";
		if (!customerGroups.has(customerName)) {
			customerGroups.set(customerName, []);
			customerOrder.push(customerName);
		}
		customerGroups.get(customerName)?.push(invoice);
	}

	const reportRows: ReportTemplateRow[] = [];
	let grandTotalOriginal = 0;
	let grandTotalReceived = 0;
	let grandTotalBalance = 0;
	let grandTotalInvoiceCount = 0;

	customerOrder.forEach((customerName, customerIndex) => {
		const customerInvoices = customerGroups.get(customerName) ?? [];
		let totalOriginal = 0;
		let totalReceived = 0;
		let totalBalance = 0;

		const detailRows = customerInvoices.map((inv, invIndex) => {
			const { originalAmount, received, balance } = getOpenInvoiceMetrics(inv, rowsByRefNo);
			totalOriginal += originalAmount;
			totalReceived += received;
			totalBalance += balance;
			grandTotalOriginal += originalAmount;
			grandTotalReceived += received;
			grandTotalBalance += balance;
			grandTotalInvoiceCount += 1;

			return createReportRow(`open-inv-detail-${customerIndex}-${invIndex}-${inv.refNo}`, {
				no: "",
				customer: "",
				date: formatFlexibleDisplayDate(inv.date),
				refNo: inv.refNo ?? "-",
				employee: inv.createdBy || "General Employee",
				originalAmount: formatNumber(originalAmount),
				received: received > 0 ? `-${formatNumber(received)}` : "",
				balance: formatNumber(balance),
			});
		});

		// 1. Customer Group Header Row
		reportRows.push({
			key: `open-inv-customer-header-${customerIndex}-${customerName}`,
			cells: {
				no: customerIndex + 1,
				customer: customerName,
				date: "",
				refNo: "",
				employee: "",
				originalAmount: "",
				received: "",
				balance: "",
			},
			rowClassName: "font-semibold bg-slate-50/40",
			cellClassNames: {
				customer: "font-semibold text-slate-900",
			},
		});

		// 2. Detail Rows (if showDetail is true)
		if (showDetail) {
			detailRows.forEach((row) => {
				reportRows.push(row);
			});
		}

		// 3. Customer Subtotal Row
		reportRows.push({
			key: `open-inv-customer-subtotal-${customerIndex}-${customerName}`,
			cells: {
				no: "",
				customer: "",
				date: "",
				refNo: "",
				employee: `Total(${customerInvoices.length})`,
				originalAmount: formatNumber(totalOriginal),
				received: totalReceived > 0 ? `-${formatNumber(totalReceived)}` : "",
				balance: formatNumber(totalBalance),
			},
			rowClassName: "font-bold bg-slate-50/60",
			cellClassNames: {
				employee: "font-bold text-slate-800 text-center",
				originalAmount: "font-bold text-slate-900",
				received: "font-bold text-slate-900",
				balance: "font-bold text-slate-900",
			},
		});
	});

	if (customerOrder.length > 0) {
		reportRows.push({
			key: "open-inv-grand-total",
			cells: {
				no: "",
				customer: `Grand Total (${grandTotalInvoiceCount})`,
				date: "",
				refNo: "",
				employee: "",
				originalAmount: formatNumber(grandTotalOriginal),
				received: grandTotalReceived > 0 ? `-${formatNumber(grandTotalReceived)}` : "",
				balance: formatNumber(grandTotalBalance),
			},
			rowClassName: "font-bold bg-slate-100/80 border-t-2 border-slate-300",
			cellClassNames: {
				customer: "font-bold text-slate-900",
				originalAmount: "font-bold text-slate-900",
				received: "font-bold text-slate-900",
				balance: "font-bold text-slate-900",
			},
		});
	}

	return reportRows;
}

export function buildReceiptDetailRows(
	invoices: Invoice[],
	previewRows: InvoiceExportPreviewRow[],
	showDetail = true,
): ReportTemplateRow[] {
	const useDefaults = invoices.length === 0 && previewRows.length === 0;
	const effectiveInvoices = useDefaults ? [...DEFAULT_OPEN_INVOICES] : invoices;
	const effectivePreviews = useDefaults ? [...DEFAULT_OPEN_INVOICE_PREVIEWS] : previewRows;
	const rowsByRefNo = groupPreviewRowsByRefNo(effectivePreviews);

	// Group payment receipts by customer
	const customerGroups = new Map<string, Invoice[]>();
	const customerOrder: string[] = [];

	for (const invoice of effectiveInvoices) {
		if (!isReceiptInvoice(invoice)) continue;

		const customerName = (invoice.customerName ?? "").trim() || "Unknown Customer";
		if (!customerGroups.has(customerName)) {
			customerGroups.set(customerName, []);
			customerOrder.push(customerName);
		}
		customerGroups.get(customerName)?.push(invoice);
	}

	const reportRows: ReportTemplateRow[] = [];
	let grandTotalOriginal = 0;
	let grandTotalReceived = 0;
	let grandTotalBalance = 0;
	let grandTotalInvoiceCount = 0;

	customerOrder.forEach((customerName, customerIndex) => {
		const customerInvoices = customerGroups.get(customerName) ?? [];
		let totalOriginal = 0;
		let totalReceived = 0;
		let totalBalance = 0;

		const detailRows = customerInvoices.map((inv, invIndex) => {
			const { originalAmount, received, balance } =
				rowsByRefNo.size > 0
					? getOpenInvoiceMetrics(inv, rowsByRefNo)
					: {
							originalAmount: (inv as any).originalAmount ?? inv.amount ?? 0,
							received: (inv as any).received ?? inv.amount ?? 0,
							balance:
								(inv as any).balance ??
								Math.max(
									0,
									((inv as any).originalAmount ?? inv.amount ?? 0) - ((inv as any).received ?? inv.amount ?? 0),
								),
						};
			totalOriginal += originalAmount;
			totalReceived += received;
			totalBalance += balance;
			grandTotalOriginal += originalAmount;
			grandTotalReceived += received;
			grandTotalBalance += balance;
			grandTotalInvoiceCount += 1;

			return createReportRow(`receipt-detail-${customerIndex}-${invIndex}-${inv.refNo}`, {
				no: "",
				customer: "",
				date: formatFlexibleDisplayDate(inv.date),
				refNo: inv.refNo ?? "-",
				employee: inv.createdBy || "General Employee",
				originalAmount: formatNumber(originalAmount),
				received: formatNumber(received),
				balance: formatNumber(balance),
			});
		});

		// 1. Customer Header Row
		reportRows.push({
			key: `receipt-customer-header-${customerIndex}-${customerName}`,
			cells: {
				no: customerIndex + 1,
				customer: customerName,
				date: "",
				refNo: "",
				employee: "",
				originalAmount: "",
				received: "",
				balance: "",
			},
			rowClassName: "font-semibold bg-slate-50/40",
			cellClassNames: {
				customer: "font-semibold text-slate-900",
			},
		});

		// 2. Detail Rows
		if (showDetail) {
			detailRows.forEach((row) => {
				reportRows.push(row);
			});
		}

		// 3. Customer Subtotal Row
		reportRows.push({
			key: `receipt-customer-subtotal-${customerIndex}-${customerName}`,
			cells: {
				no: "",
				customer: "",
				date: "",
				refNo: "",
				employee: `Total(${customerInvoices.length})`,
				originalAmount: formatNumber(totalOriginal),
				received: formatNumber(totalReceived),
				balance: formatNumber(totalBalance),
			},
			rowClassName: "font-bold bg-slate-50/60",
			cellClassNames: {
				employee: "font-bold text-slate-800 text-center",
				originalAmount: "font-bold text-slate-900",
				received: "font-bold text-slate-900",
				balance: "font-bold text-slate-900",
			},
		});
	});

	// Grand Total Row
	reportRows.push({
		key: "receipt-grand-total",
		cells: {
			no: "",
			customer: `Grand Total (${grandTotalInvoiceCount})`,
			date: "",
			refNo: "",
			employee: "",
			originalAmount: formatNumber(grandTotalOriginal),
			received: formatNumber(grandTotalReceived),
			balance: formatNumber(grandTotalBalance),
		},
		rowClassName: "font-bold bg-slate-100/80 border-t-2 border-slate-300",
		cellClassNames: {
			customer: "font-bold text-slate-900",
			originalAmount: "font-bold text-slate-900",
			received: "font-bold text-slate-900",
			balance: "font-bold text-slate-900",
		},
	});

	return reportRows;
}

export function buildCustomerTransactionRows(invoices: Invoice[]): ReportTemplateRow[] {
	return invoices.map((invoice, index) =>
		createIndexedReportRow(invoice.id, index, {
			date: formatFlexibleDisplayDate(invoice.date),
			refNo: invoice.refNo ?? "-",
			customer: invoice.customerName ?? "-",
			type: getCustomerSaleType(invoice),
			amount: formatNumber(invoice.amount ?? 0),
			memo: "-",
		}),
	);
}

export function buildSaleDetailRows(invoices: Invoice[], exportLines: InvoiceExportLineApi[]): ReportTemplateRow[] {
	const typeByRefNo = buildInvoiceTypeMap(invoices);
	const groups = new Map<string, InvoiceExportLineApi[]>();
	const groupOrder: string[] = [];

	for (const line of exportLines) {
		// Use trimmed customer name as group key
		const groupKey = (line.customerName ?? "").trim() || "Unknown customer";
		// Initialize group if it doesn't exist
		if (!groups.has(groupKey)) {
			// Create a new group
			groups.set(groupKey, []);
			// Maintain the order of groups as they first appear
			groupOrder.push(groupKey);
		}
		// Add line to the appropriate group
		groups.get(groupKey)?.push(line);
	}

	return groupOrder.flatMap((customerName, groupIndex) => {
		const customerLines = groups.get(customerName) ?? [];
		const totalQuantity = customerLines.reduce((sum, line) => sum + (line.quantity ?? 0), 0);
		const totalAmount = customerLines.reduce((sum, line) => sum + (line.amount ?? line.total ?? 0), 0);

		const headerRow = createReportRow(`customer-group-${groupIndex}-${customerName}`, {
			no: groupIndex + 1,
			customer: customerName,
			date: "",
			refNo: "",
			type: "",
			category: "",
			item: "",
			qty: "",
			price: "",
			amount: "",
		});
		headerRow.rowClassName = "font-semibold";
		headerRow.cellClassNames = {
			customer: "font-semibold",
		};

		const detailRows = customerLines.map((line, lineIndex) => {
			const displayType = typeByRefNo.get(line.refNo ?? "") ?? "cash_sale";

			return createReportRow(`sale-${groupIndex}-${lineIndex}-${line.refNo ?? "ref"}-${line.productName ?? "item"}`, {
				no: "",
				customer: "",
				date: formatFlexibleDisplayDate(line.date),
				refNo: line.refNo ?? "-",
				type: displayType,
				category: getProductCategory(line.productName),
				item: line.productName ?? "-",
				qty: formatNumber(line.quantity ?? 0),
				price: formatNumber(line.pricePerProduct ?? 0),
				amount: formatNumber(line.amount ?? line.total ?? 0),
			});
		});

		const totalRow = createReportRow(`customer-group-${groupIndex}-${customerName}-total`, {
			no: "",
			customer: "",
			date: "",
			refNo: "",
			type: "",
			category: "",
			item: `TOTAL(${customerLines.length})`,
			qty: formatNumber(totalQuantity),
			price: "",
			amount: formatNumber(totalAmount),
		});
		totalRow.rowClassName = "font-semibold";
		totalRow.cellClassNames = {
			item: "text-right",
			qty: "text-right",
			amount: "text-right",
		};

		return [headerRow, ...detailRows, totalRow];
	});
}

export const DEFAULT_CUSTOMER_TRANSACTION_INVOICES: readonly Invoice[] = [
	{
		id: "tx-inv-1",
		refNo: "IN00021268",
		customerName: "A001:អតិថិជនទូទៅ",
		date: "2026-09-01T16:16:32",
		amount: 9000,
	} as Invoice,
	{
		id: "tx-inv-2",
		refNo: "IN00021269",
		customerName: "A001:អតិថិជនទូទៅ",
		date: "2026-09-02T16:16:42",
		amount: 18000,
	} as Invoice,
];

export const DEFAULT_CUSTOMER_TRANSACTION_PREVIEWS: readonly InvoiceExportPreviewRow[] = [
	{
		refNo: "IN00021268",
		quantity: 5,
		amount: 9000,
		paid: 9000,
		balance: 0,
	} as InvoiceExportPreviewRow,
	{
		refNo: "IN00021269",
		quantity: 10,
		amount: 18000,
		paid: 0,
		balance: 18000,
	} as InvoiceExportPreviewRow,
];

export function buildCustomerTransactionDetailByTypeRows(
	invoices: Invoice[],
	previewRows: InvoiceExportPreviewRow[],
): ReportTemplateRow[] {
	if (invoices.length === 0) return [];
	const rowsByRefNo = groupPreviewRowsByRefNo(previewRows);

	const reportRows: ReportTemplateRow[] = [];

	// ── 1. SECTION 1: INVOICE ──────────────────────────────────────
	const invoiceCustomerGroups = new Map<string, Invoice[]>();
	const invoiceCustomerOrder: string[] = [];

	for (const inv of invoices) {
		const custName = (inv.customerName ?? "").trim() || "Unknown Customer";
		if (!invoiceCustomerGroups.has(custName)) {
			invoiceCustomerGroups.set(custName, []);
			invoiceCustomerOrder.push(custName);
		}
		invoiceCustomerGroups.get(custName)?.push(inv);
	}

	if (invoiceCustomerOrder.length > 0) {
		// Section 1 Header Banner
		reportRows.push({
			key: "sec-invoice-header",
			cells: {
				no: "",
				date: "Invoice",
				refNo: "",
				category: "",
				term: "",
				dueDate: "",
				qty: "",
				amount: "",
				discount: "",
				total: "",
				remaining: "",
			},
			rowClassName: "font-bold text-slate-900 bg-slate-100/70 border-y border-slate-300",
			cellClassNames: {
				date: "font-bold text-slate-900",
			},
		});

		let sectionInvoiceQty = 0;
		let sectionInvoiceAmount = 0;
		let sectionInvoiceRemaining = 0;
		let totalInvoiceItemCount = 0;

		invoiceCustomerOrder.forEach((custName, custIndex) => {
			const custInvoices = invoiceCustomerGroups.get(custName) ?? [];
			totalInvoiceItemCount += custInvoices.length;

			let custQty = 0;
			let custAmount = 0;
			let custRemaining = 0;

			// Customer Group Header
			reportRows.push({
				key: `tx-inv-cust-${custIndex}-${custName}`,
				cells: {
					no: custIndex + 1,
					date: custName,
					refNo: "",
					category: "",
					term: "",
					dueDate: "",
					qty: "",
					amount: "",
					discount: "",
					total: "",
					remaining: "",
				},
				rowClassName: "font-semibold bg-slate-50/40",
				cellClassNames: {
					date: "font-semibold text-slate-900",
				},
			});

			custInvoices.forEach((inv, invIdx) => {
				const { originalAmount, balance } = getOpenInvoiceMetrics(inv, rowsByRefNo);
				const pRows = rowsByRefNo.get(inv.refNo ?? "") ?? [];
				const qty = pRows.reduce((sum, r) => sum + (r.quantity ?? 0), 0) || 1;

				custQty += qty;
				custAmount += originalAmount;
				custRemaining += balance;

				sectionInvoiceQty += qty;
				sectionInvoiceAmount += originalAmount;
				sectionInvoiceRemaining += balance;

				reportRows.push({
					key: `tx-inv-row-${custIndex}-${invIdx}-${inv.refNo}`,
					cells: {
						no: "",
						date: formatFlexibleDisplayDate(inv.date),
						refNo: inv.refNo ?? "-",
						category: getProductCategory(pRows[0]?.productName),
						term: inv.paymentTerm ?? "",
						dueDate: "",
						qty: formatNumber(qty),
						amount: formatNumber(originalAmount),
						discount: "",
						total: formatNumber(originalAmount),
						remaining: balance > 0 ? formatNumber(balance) : "",
					},
				});
			});

			// Customer Subtotal
			reportRows.push({
				key: `tx-inv-cust-subtotal-${custIndex}-${custName}`,
				cells: {
					no: "",
					date: "",
					refNo: "",
					category: "",
					term: "",
					dueDate: `Total (${custInvoices.length})`,
					qty: formatNumber(custQty),
					amount: formatNumber(custAmount),
					discount: "",
					total: formatNumber(custAmount),
					remaining: formatNumber(custRemaining),
				},
				rowClassName: "font-bold bg-slate-50/60",
				cellClassNames: {
					dueDate: "font-bold text-slate-800 text-right",
					qty: "font-bold",
					amount: "font-bold",
					total: "font-bold",
					remaining: "font-bold",
				},
			});
		});

		// Section Grand Total Row
		reportRows.push({
			key: "sec-invoice-grand-total",
			cells: {
				no: "",
				date: "",
				refNo: "",
				category: "",
				term: "",
				dueDate: `Total Invoice (${totalInvoiceItemCount})`,
				qty: formatNumber(sectionInvoiceQty),
				amount: formatNumber(sectionInvoiceAmount),
				discount: "",
				total: formatNumber(sectionInvoiceAmount),
				remaining: formatNumber(sectionInvoiceRemaining),
			},
			rowClassName: "font-bold bg-slate-100/60 border-t-2 border-slate-300",
			cellClassNames: {
				dueDate: "font-bold text-slate-900 text-right",
				qty: "font-bold",
				amount: "font-bold",
				total: "font-bold",
				remaining: "font-bold",
			},
		});
	}

	// ── 2. SECTION 2: RECEIPT ──────────────────────────────────────
	// Rule: "nếu có invoice, không receipt => chỉ show invoice, không cần show customer ở receipt section"
	const receiptCustomerGroups = new Map<
		string,
		Array<{
			date: string;
			refNo: string;
			fromRefNo: string;
			openAmount: number;
			received: number;
		}>
	>();
	const receiptCustomerOrder: string[] = [];

	for (const inv of invoices) {
		const { originalAmount, received } = getOpenInvoiceMetrics(inv, rowsByRefNo);
		if (received <= 0) continue; // Skip if no receipt / payment made

		const custName = (inv.customerName ?? "").trim() || "Unknown Customer";
		if (!receiptCustomerGroups.has(custName)) {
			receiptCustomerGroups.set(custName, []);
			receiptCustomerOrder.push(custName);
		}
		receiptCustomerGroups.get(custName)?.push({
			date: inv.date ?? "",
			refNo: `REC-${inv.refNo}`,
			fromRefNo: inv.refNo ?? "-",
			openAmount: originalAmount,
			received,
		});
	}

	if (receiptCustomerOrder.length > 0) {
		// Section 2 Header Banner
		reportRows.push({
			key: "sec-receipt-header",
			cells: {
				no: "",
				date: "Receipt",
				refNo: "",
				category: "",
				term: "",
				dueDate: "",
				qty: "",
				amount: "",
				discount: "",
				total: "",
				remaining: "",
			},
			rowClassName: "font-bold text-slate-900 bg-slate-100/70 border-y border-slate-300 mt-4",
			cellClassNames: {
				date: "font-bold text-slate-900",
			},
		});

		let sectionReceiptTotal = 0;
		let totalReceiptItemCount = 0;

		receiptCustomerOrder.forEach((custName, custIndex) => {
			const custReceipts = receiptCustomerGroups.get(custName) ?? [];
			totalReceiptItemCount += custReceipts.length;
			let custReceiptReceived = 0;

			// Customer Header Row
			reportRows.push({
				key: `tx-rcp-cust-${custIndex}-${custName}`,
				cells: {
					no: custIndex + 1,
					date: custName,
					refNo: "",
					category: "",
					term: "",
					dueDate: "",
					qty: "",
					amount: "",
					discount: "",
					total: "",
					remaining: "",
				},
				rowClassName: "font-semibold bg-slate-50/40",
				cellClassNames: {
					date: "font-semibold text-slate-900",
				},
			});

			custReceipts.forEach((rcp, rcpIdx) => {
				custReceiptReceived += rcp.received;
				sectionReceiptTotal += rcp.received;

				reportRows.push({
					key: `tx-rcp-row-${custIndex}-${rcpIdx}-${rcp.refNo}`,
					cells: {
						no: "",
						date: formatFlexibleDisplayDate(rcp.date),
						refNo: rcp.refNo,
						category: getProductCategory(rowsByRefNo.get(rcp.fromRefNo)?.[0]?.productName),
						term: rcp.fromRefNo,
						dueDate: formatNumber(rcp.openAmount),
						qty: "",
						amount: formatNumber(rcp.received),
						discount: "",
						total: formatNumber(rcp.received),
						remaining: "",
					},
				});
			});

			// Customer Subtotal
			reportRows.push({
				key: `tx-rcp-cust-subtotal-${custIndex}-${custName}`,
				cells: {
					no: "",
					date: "",
					refNo: "",
					category: "",
					term: "",
					dueDate: `Total(${custReceipts.length})`,
					qty: "",
					amount: "",
					discount: "",
					total: formatNumber(custReceiptReceived),
					remaining: "",
				},
				rowClassName: "font-bold bg-slate-50/60",
				cellClassNames: {
					dueDate: "font-bold text-slate-800 text-right",
					total: "font-bold",
				},
			});
		});

		// Section Grand Total
		reportRows.push({
			key: "sec-receipt-grand-total",
			cells: {
				no: "",
				date: "",
				refNo: "",
				category: "",
				term: "",
				dueDate: `Grand Total (${totalReceiptItemCount})`,
				qty: "",
				amount: "",
				discount: "",
				total: formatNumber(sectionReceiptTotal),
				remaining: "",
			},
			rowClassName: "font-bold bg-slate-100/60 border-t-2 border-slate-300",
			cellClassNames: {
				dueDate: "font-bold text-slate-900 text-right",
				total: "font-bold",
			},
		});
	}

	return reportRows;
}
