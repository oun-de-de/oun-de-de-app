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
		title: "Inventory Stock Report",
		templateId: "ice-bag-inventory-stock-report",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildInventoryStockColumns,
		buildRows: buildInventoryStockRows,
		dataSource: "inventory-stock-report-api",
		filterConfig: REPORT_FILTERS.dateRangeOnly,
	},
	"product-list": {
		slug: "product-list",
		title: "Product List",
		templateId: "unsupported",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildProductListColumns,
		buildRows: buildProductListReportRows,
		dataSource: "product-list",
		filterConfig: REPORT_FILTERS.noFilters,
	},
	"company-asset": {
		slug: "company-asset",
		title: "Company Asset Register",
		templateId: "company-asset-register",
		subtitle: REPORT_DEFAULT_DATE,
		buildColumns: buildCompanyAssetColumns,
		buildRows: buildCompanyAssetRegisterRows,
		dataSource: "asset-list",
		filterConfig: REPORT_FILTERS.noFilters,
	},
};
