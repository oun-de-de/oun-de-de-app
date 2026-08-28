import type { ReportDefinition, ReportDefinitionMap } from "../report-types";
import { ACCOUNTING_REPORT_SPECS } from "./accounting-report-specs";
import { CORE_REPORT_SPECS } from "./core-report-specs";
import { DAILY_REPORT_SPECS } from "./daily-report-specs";
import { INVENTORY_REPORT_SPECS } from "./inventory-report-specs";
import { INVOICE_REPORT_SPECS } from "./invoice-report-specs";
import { LOAN_REPORT_SPECS } from "./loan-report-specs";

export * from "./accounting-report-specs";
export * from "./core-report-specs";
export * from "./daily-report-specs";
export * from "./inventory-report-specs";
export * from "./invoice-report-specs";
export * from "./loan-report-specs";

export const REPORT_REGISTRY: ReportDefinitionMap = {
	...INVOICE_REPORT_SPECS,
	...CORE_REPORT_SPECS,
	...LOAN_REPORT_SPECS,
	...INVENTORY_REPORT_SPECS,
	...ACCOUNTING_REPORT_SPECS,
	...DAILY_REPORT_SPECS,
};

export const DEFAULT_REPORT_SLUG = "open-invoice-detail-by-customer";

export function hasReportDefinition(slug?: string): slug is string {
	return !!slug && slug in REPORT_REGISTRY;
}

export function getReportDefinition(slug?: string): ReportDefinition {
	return hasReportDefinition(slug) ? REPORT_REGISTRY[slug] : REPORT_REGISTRY[DEFAULT_REPORT_SLUG];
}
