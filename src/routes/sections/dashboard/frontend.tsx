import type { RouteObject } from "react-router";
import ReportDetailTemplate from "@/pages/dashboard/reports/report-detail";
import { Component } from "../../utils/utils";

const createLoanRoutes = (basePath: "dashboard/borrow" | "dashboard/loan"): RouteObject[] => [
	{ path: basePath, element: Component("/pages/dashboard/borrow") },
	{ path: `${basePath}/new`, element: Component("/pages/dashboard/borrow/create") },
	{ path: `${basePath}/payment`, element: Component("/pages/dashboard/borrow/payment") },
	{ path: `${basePath}/:id`, element: Component("/pages/dashboard/borrow/detail") },
];

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{ index: true, element: Component("/pages/dashboard/_dashboard") },
		{ path: "dashboard/customers", element: Component("/pages/dashboard/customers") },
		{ path: "dashboard/customers/create", element: Component("/pages/dashboard/customers/create") },
		{ path: "dashboard/customers/edit/:id", element: Component("/pages/dashboard/customers/edit") },
		{ path: "dashboard/customers/create-receipt", element: Component("/pages/dashboard/customers/create-receipt") },
		{ path: "dashboard/employees", element: Component("/pages/dashboard/employees") },
		{ path: "dashboard/employees/create", element: Component("/pages/dashboard/employees/create") },
		{ path: "dashboard/employees/edit/:id", element: Component("/pages/dashboard/employees/edit") },
		{ path: "dashboard/invoice", element: Component("/pages/dashboard/invoice") },
		{ path: "dashboard/invoice/export-preview", element: Component("/pages/dashboard/invoice/export-preview") },
		{ path: "dashboard/products", element: Component("/pages/dashboard/products") },
		{ path: "dashboard/products/create", element: Component("/pages/dashboard/products/create") },
		{ path: "dashboard/products/edit/:id", element: Component("/pages/dashboard/products/edit") },
		{ path: "dashboard/coupons", element: Component("/pages/dashboard/coupons") },
		{ path: "dashboard/coupons/create", element: Component("/pages/dashboard/coupons/create") },
		{ path: "dashboard/accounting", element: Component("/pages/dashboard/accounting") },
		{ path: "dashboard/reports", element: Component("/pages/dashboard/reports") },
		{ path: "dashboard/reports/detail/:slug", element: <ReportDetailTemplate /> },
		{ path: "dashboard/settings", element: Component("/pages/dashboard/settings") },
		{ path: "dashboard/audit-log", element: Component("/pages/dashboard/audit-log") },
		...createLoanRoutes("dashboard/borrow"),
		...createLoanRoutes("dashboard/loan"),
		{ path: "dashboard/equipment", element: Component("/pages/dashboard/equipment") },
		{ path: "dashboard/equipment/:id", element: Component("/pages/dashboard/equipment/detail") },
	];
	return frontendDashboardRoutes;
}
