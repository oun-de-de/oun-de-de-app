import type { InventoryItem } from "@/core/types/inventory";
import type { Product } from "@/core/types/product";
import type { InventoryStockReportLine } from "@/core/types/report";
import { formatFlexibleDisplayDate, parseFlexibleDateToUtcTime } from "@/core/utils/date-display";
import { formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";
import { parseDisplayDate, parseNumericCell, parseReportDateInput } from "../report-table-utils";
import { createIndexedReportRow, createReportRow } from "./report-row-helpers";

const INVENTORY_SUPPLIER = {
	name: "LC 1988 Supply",
	phone: "070669898",
	address: "Phnom Penh",
} as const;

const EMPTY_CELL = "-";

function getInventoryItemKey(row: ReportTemplateRow) {
	return String(row.cells.itemCode ?? row.cells.balanceName ?? row.key).trim();
}

function buildInventoryMovementCells(params: {
	itemCode?: string | null;
	itemName?: string | null;
	date?: string | null;
	quantity: number;
	isInbound: boolean;
	supplierName?: string | null;
	supplierPhone?: string | null;
	supplierAddress?: string | null;
	balanceQty: number;
}) {
	const itemName = params.itemName ?? EMPTY_CELL;
	const itemCode = params.itemCode ?? EMPTY_CELL;
	const dateText = formatFlexibleDisplayDate(params.date);
	const quantityText = formatNumber(params.quantity);

	return {
		stockInDate: params.isInbound ? dateText : EMPTY_CELL,
		itemCode,
		itemName,
		stockInQty: params.isInbound ? quantityText : EMPTY_CELL,
		stockOutDate: params.isInbound ? EMPTY_CELL : dateText,
		stockOutName: params.isInbound ? EMPTY_CELL : itemName,
		stockOutQty: params.isInbound ? EMPTY_CELL : quantityText,
		balanceDate: dateText,
		balanceName: itemName,
		balanceQty: formatNumber(params.balanceQty),
		supplierName: params.supplierName ?? EMPTY_CELL,
		supplierPhone: params.supplierPhone ?? EMPTY_CELL,
		supplierAddress: params.supplierAddress ?? EMPTY_CELL,
	};
}

function buildAssetDetail(item: InventoryItem) {
	return [
		item.unit?.name ? `Unit: ${item.unit.name}` : null,
		item.code ? `Code: ${item.code}` : `Asset ID: ${item.id}`,
		item.type ? `Type: ${item.type}` : null,
	]
		.filter(Boolean)
		.join(" | ");
}

function buildAssetOther(item: InventoryItem) {
	return (
		[
			item.alertThreshold ? `Alert threshold: ${formatNumber(item.alertThreshold)}` : null,
			item.unit?.type ? `Unit type: ${item.unit.type}` : null,
		]
			.filter(Boolean)
			.join(" | ") || EMPTY_CELL
	);
}

function resolveProductQuantity(product: Product) {
	return typeof product.defaultProductSetting?.quantity === "number" ? product.defaultProductSetting.quantity : null;
}

function resolveProductPrice(product: Product) {
	return typeof product.defaultProductSetting?.price === "number" ? product.defaultProductSetting.price : null;
}

export function buildProductListRows(products: Product[]): ReportTemplateRow[] {
	return products.map((product, index) => {
		const quantity = resolveProductQuantity(product);
		const price = resolveProductPrice(product);

		return createIndexedReportRow(product.id, index, {
			name: product.name ?? "-",
			unit: product.unit?.name ?? "-",
			quantity: formatNumber(quantity, "-"),
			price: formatNumber(price, "-"),
		});
	});
}

export function buildInventoryBagRows(products: Product[]): ReportTemplateRow[] {
	return products.map((product) => {
		const quantity = resolveProductQuantity(product) ?? 0;
		const stockInQty = Math.max(quantity, 0);
		const stockOutQty = Math.max(Math.round(quantity * 0.35), 0);
		const balanceQty = Math.max(stockInQty - stockOutQty, 0);

		return createReportRow(
			`inventory-${product.id}`,
			buildInventoryMovementCells({
				itemCode: product.refNo ?? product.id,
				itemName: product.name,
				date: product.date,
				quantity: stockInQty,
				isInbound: true,
				supplierName: INVENTORY_SUPPLIER.name,
				supplierPhone: INVENTORY_SUPPLIER.phone,
				supplierAddress: INVENTORY_SUPPLIER.address,
				balanceQty,
			}),
		);
	});
}

export function buildInventoryStockReportRows(lines: InventoryStockReportLine[] | undefined): ReportTemplateRow[] {
	if (!lines?.length) return [];

	const runningBalanceByItem = new Map<string, number>();

	return [...lines]
		.map((line) => ({
			line,
			sortTime: parseFlexibleDateToUtcTime(line.createdAt),
		}))
		.sort((left, right) => {
			return left.sortTime - right.sortTime;
		})
		.map(({ line }, index) => {
			const itemKey = line.itemCode?.trim() || line.itemName?.trim() || `item-${index}`;
			const previousBalance = runningBalanceByItem.get(itemKey) ?? 0;
			const quantity = Number(line.quantity ?? 0);
			const isInbound = line.type === "IN";
			const nextBalance = isInbound ? previousBalance + quantity : previousBalance - quantity;

			runningBalanceByItem.set(itemKey, nextBalance);

			return createReportRow(
				`inventory-stock-${index}-${itemKey}`,
				buildInventoryMovementCells({
					itemCode: line.itemCode,
					itemName: line.itemName,
					date: line.createdAt,
					quantity,
					isInbound,
					supplierName: line.reason,
					balanceQty: nextBalance,
				}),
			);
		});
}

/**
 * An item that still holds stock but saw no movement in the range is carried forward as an
 * opening-balance row: name and balance only. Reusing its last movement row would show that
 * movement's date and in/out quantities as if they happened inside the range.
 */
function createOpeningBalanceRow(row: ReportTemplateRow): ReportTemplateRow {
	const itemKey = getInventoryItemKey(row);

	return {
		key: `inventory-opening-${itemKey}`,
		cells: {
			...row.cells,
			stockInDate: EMPTY_CELL,
			stockInQty: EMPTY_CELL,
			stockOutDate: EMPTY_CELL,
			stockOutName: EMPTY_CELL,
			stockOutQty: EMPTY_CELL,
			balanceDate: EMPTY_CELL,
			supplierName: EMPTY_CELL,
			supplierPhone: EMPTY_CELL,
			supplierAddress: EMPTY_CELL,
		},
	};
}

export function filterInventoryStockReportRowsByDate(
	rows: ReportTemplateRow[],
	fromDate: string | undefined,
	toDate: string | undefined,
): ReportTemplateRow[] {
	if (!fromDate && !toDate) return rows;

	const fromTime = parseReportDateInput(fromDate);
	const toTime = parseReportDateInput(toDate, true);

	const rowsWithinRange = rows.filter((row) => {
		const rowTime = parseDisplayDate(row.cells.balanceDate);
		return Number.isFinite(rowTime) && rowTime >= fromTime && rowTime <= toTime;
	});

	// Rows arrive oldest-first, so the last one per item carries its running balance.
	const latestRowByItem = new Map<string, ReportTemplateRow>();
	for (const row of rows) {
		latestRowByItem.set(getInventoryItemKey(row), row);
	}

	const visibleItemKeys = new Set(rowsWithinRange.map(getInventoryItemKey));
	const openingRows: ReportTemplateRow[] = [];

	for (const [itemKey, row] of latestRowByItem.entries()) {
		if (visibleItemKeys.has(itemKey)) continue;
		if (parseNumericCell(row.cells.balanceQty) <= 0) continue;

		openingRows.push(createOpeningBalanceRow(row));
	}

	return [...openingRows, ...rowsWithinRange];
}

export function buildCompanyAssetRows(items: InventoryItem[]): ReportTemplateRow[] {
	return items.map((item, index) =>
		createIndexedReportRow(`asset-${item.id}`, index, {
			name: item.name ?? "-",
			entryDate: EMPTY_CELL,
			supplierName: item.code ? `Code ${item.code}` : "Internal record",
			supplierPhone: EMPTY_CELL,
			supplierAddress: EMPTY_CELL,
			detail: buildAssetDetail(item),
			debit: formatNumber(item.quantityOnHand),
			credit: EMPTY_CELL,
			balance: formatNumber(item.quantityOnHand),
			qty: formatNumber(item.quantityOnHand),
			other: buildAssetOther(item),
		}),
	);
}
