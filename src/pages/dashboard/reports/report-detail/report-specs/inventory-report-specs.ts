import {
	buildCompanyAssetRows,
	filterInventoryStockReportRowsByDate,
	buildInventoryStockReportRows,
	buildProductListRows,
} from "../components/report-table-builders";
import { REPORT_DEFAULT_DATE } from "../constants";
import {
	buildCompanyAssetColumns,
	buildInventoryStockColumns,
	buildProductListColumns,
} from "../report-columns/inventory-report-columns";
import { REPORT_FILTERS, type BuildReportRowsParams, type ReportDefinitionMap } from "../report-types";
import { REPORT_TITLES } from "../../report-titles";

function buildInventoryStockRows({ inventoryStockReport, inventoryDateFrom, inventoryDateTo }: BuildReportRowsParams) {
	return filterInventoryStockReportRowsByDate(
		buildInventoryStockReportRows(inventoryStockReport),
		inventoryDateFrom,
		inventoryDateTo,
	);
}

function buildProductListReportRows({ products }: BuildReportRowsParams) {
	return buildProductListRows(products);
}

function buildCompanyAssetRegisterRows({ inventoryItems }: BuildReportRowsParams) {
	return buildCompanyAssetRows(inventoryItems ?? []);
}

export const INVENTORY_REPORT_SPECS: ReportDefinitionMap = {
	"inventory-valuation-summary": {
		slug: "inventory-valuation-summary",
		title: REPORT_TITLES["inventory-valuation-summary"],
		templateId: "ice-bag-inventory-stock-report",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildInventoryStockColumns,
		buildRows: buildInventoryStockRows,
		dataSource: "inventory-stock-report-api",
		filterConfig: REPORT_FILTERS.dateRangeOnly,
	},
	"product-list": {
		slug: "product-list",
		title: REPORT_TITLES["product-list"],
		templateId: "unsupported",
		buildColumns: buildProductListColumns,
		buildRows: buildProductListReportRows,
		dataSource: "product-list",
		filterConfig: REPORT_FILTERS.noFilters,
	},
	"company-asset": {
		slug: "company-asset",
		title: REPORT_TITLES["company-asset"],
		templateId: "company-asset-register",
		buildColumns: buildCompanyAssetColumns,
		buildRows: buildCompanyAssetRegisterRows,
		dataSource: "asset-list",
		filterConfig: REPORT_FILTERS.noFilters,
	},
};
