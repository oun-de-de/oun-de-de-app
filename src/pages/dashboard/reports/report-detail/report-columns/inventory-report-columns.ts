import type { ReportTemplateColumn } from "../../components/layout/report-template-table";
import { buildSizedColumns } from "../report-column-helpers";

export function buildProductListColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "NO", "w-[5%]", "center"],
		["name", "PRODUCT NAME", "w-[30%]"],
		["unit", "UNIT", "w-[10%]", "center"],
		["quantity", "DEFAULT QTY", "w-[10%]", "right"],
		["price", "DEFAULT PRICE", "w-[15%]", "right"],
	]);
}

export function buildInventoryStockColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["stockInDate", "DATE", "w-[9%]", "center"],
		["itemCode", "ITEM CODE", "w-[10%]"],
		["itemName", "ITEM NAME", "w-[16%]"],
		["stockInQty", "QTY IN", "w-[8%]", "right"],
		["stockOutDate", "DATE OUT", "w-[9%]", "center"],
		["stockOutName", "ITEM NAME OUT", "w-[14%]"],
		["stockOutQty", "QTY OUT", "w-[8%]", "right"],
		["balanceDate", "BALANCE DATE", "w-[9%]", "center"],
		["balanceName", "BALANCE ITEM", "w-[14%]"],
		["balanceQty", "BALANCE QTY", "w-[8%]", "right"],
		["supplierName", "SUPPLIER NAME", "w-[12%]"],
		["supplierPhone", "SUPPLIER PHONE", "w-[11%]"],
		["supplierAddress", "SUPPLIER ADDRESS", "w-[16%]"],
	]);
}

export function buildCompanyAssetColumns(): ReportTemplateColumn[] {
	return buildSizedColumns([
		["no", "NO.", "w-[5%]", "center"],
		["name", "ITEMS' NAME", "w-[18%]"],
		["entryDate", "ENTRY DATE", "w-[12%]", "center"],
		["supplierName", "SUPPLIER", "w-[12%]"],
		["supplierPhone", "PHONE", "w-[10%]"],
		["supplierAddress", "ADDRESS", "w-[12%]"],
		["detail", "DETAIL", "w-[16%]"],
		["debit", "DEBIT", "w-[10%]", "right"],
		["credit", "CREDIT", "w-[10%]", "right"],
		["balance", "BALANCE", "w-[10%]", "right"],
		["qty", "QTY", "w-[7%]", "right"],
		["other", "OTHER", "w-[10%]"],
	]);
}
