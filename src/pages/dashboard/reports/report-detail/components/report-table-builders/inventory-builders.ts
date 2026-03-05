import type { Product } from "@/core/types/product";
import { formatDisplayDate, formatNumber } from "@/core/utils/formatters";
import type { ReportTemplateRow } from "../../../components/layout/report-template-table";

export function buildProductListRows(products: Product[]): ReportTemplateRow[] {
	return products.map((product, index) => ({
		key: product.id,
		cells: {
			no: index + 1,
			name: product.name ?? "-",
			unit: product.unit?.name ?? "-",
			quantity: formatNumber(product.quantity),
			cost: formatNumber(product.cost),
			price: formatNumber(product.price),
			value: formatNumber(product.quantity * product.cost),
		},
	}));
}

export function buildInventoryBagRows(products: Product[]): ReportTemplateRow[] {
	return products.map((product) => {
		const stockInQty = Math.max(product.quantity, 0);
		const stockOutQty = Math.max(Math.round(product.quantity * 0.35), 0);
		const balanceQty = Math.max(stockInQty - stockOutQty, 0);
		return {
			key: `inventory-${product.id}`,
			cells: {
				stockInDate: formatDisplayDate(product.date),
				itemCode: product.refNo ?? product.id,
				itemName: product.name ?? "-",
				stockInQty: formatNumber(stockInQty),
				stockOutDate: formatDisplayDate(product.date),
				stockOutQty: formatNumber(stockOutQty),
				balanceQty: formatNumber(balanceQty),
				supplierName: "LC 1988 Supply",
				supplierPhone: "070669898",
				supplierAddress: "Phnom Penh",
			},
		};
	});
}

export function buildCompanyAssetRows(products: Product[]): ReportTemplateRow[] {
	return products.map((product, index) => ({
		key: `asset-${product.id}`,
		cells: {
			no: index + 1,
			name: product.name ?? "-",
			entryDate: formatDisplayDate(product.date),
			supplierName: "LC 1988 Supply",
			supplierPhone: "070669898",
			supplierAddress: "Phnom Penh",
			detail: `${product.unit?.name ?? "Unit"} / Ref ${product.refNo ?? product.id}`,
			debit: formatNumber(product.quantity * product.cost),
			credit: "-",
			balance: formatNumber(product.quantity * product.cost),
			qty: formatNumber(product.quantity),
			other: product.defaultProductSetting ? `Default ${product.defaultProductSetting.quantity}` : "-",
		},
	}));
}
