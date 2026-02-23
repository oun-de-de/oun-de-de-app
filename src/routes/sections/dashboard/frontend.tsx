import type { RouteObject } from "react-router";
import { Component } from "../../utils/utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{ index: true, element: Component("/pages/dashboard/_dashboard") },
		{ path: "dashboard/customers", element: Component("/pages/dashboard/customers") },
		{ path: "dashboard/customers/create", element: Component("/pages/dashboard/customers/create") },
		{ path: "dashboard/customers/edit/:id", element: Component("/pages/dashboard/customers/edit") },
		{ path: "dashboard/customers/create-receipt", element: Component("/pages/dashboard/customers/create-receipt") },
		{ path: "dashboard/invoice", element: Component("/pages/dashboard/invoice") },
		{ path: "dashboard/invoice/export-preview", element: Component("/pages/dashboard/invoice/export-preview") },
		{ path: "dashboard/vendors", element: Component("/pages/dashboard/vendors") },
		{ path: "dashboard/products", element: Component("/pages/dashboard/products") },
		{ path: "dashboard/products/create", element: Component("/pages/dashboard/products/create") },
		{ path: "dashboard/coupons", element: Component("/pages/dashboard/coupons") },
		{ path: "dashboard/coupons/create", element: Component("/pages/dashboard/coupons/create") },
		{ path: "dashboard/accounting", element: Component("/pages/dashboard/accounting") },
		{ path: "dashboard/reports", element: Component("/pages/dashboard/reports") },
		{ path: "dashboard/reports/detail/:slug", element: Component("/pages/dashboard/reports/report-detail") },
		{ path: "dashboard/settings", element: Component("/pages/dashboard/settings") },
		{ path: "dashboard/audit-log", element: Component("/pages/dashboard/audit-log") },
		{ path: "dashboard/borrow", element: Component("/pages/dashboard/borrow") },
		{ path: "dashboard/borrow/new", element: Component("/pages/dashboard/borrow/create") },
		{ path: "dashboard/borrow/payment", element: Component("/pages/dashboard/borrow/payment") },
		{ path: "dashboard/borrow/:id", element: Component("/pages/dashboard/borrow/detail") },
		{ path: "dashboard/equipment", element: Component("/pages/dashboard/equipment") },
		{ path: "dashboard/equipment/:id", element: Component("/pages/dashboard/equipment/detail") },
	];
	return frontendDashboardRoutes;
}
