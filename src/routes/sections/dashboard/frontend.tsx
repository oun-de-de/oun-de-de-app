import type { RouteObject } from "react-router";
import { Component } from "./utils";

export function getFrontendDashboardRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{ index: true, element: Component("/pages/dashboard/_dashboard") },
		{
			path: "dashboard/sale",
			children: [{ path: "new", element: Component("/pages/dashboard/sale/new") }],
		},
		{ path: "dashboard/customers", element: Component("/pages/dashboard/customers") },
		{ path: "dashboard/vendors", element: Component("/pages/dashboard/vendors") },
		{ path: "dashboard/products", element: Component("/pages/dashboard/products") },
		{ path: "dashboard/accounting", element: Component("/pages/dashboard/accounting") },
		{ path: "dashboard/reports", element: Component("/pages/dashboard/reports") },
		{ path: "dashboard/settings", element: Component("/pages/dashboard/settings") },
		{ path: "dashboard/audit-log", element: Component("/pages/dashboard/audit-log") },
	];
	return frontendDashboardRoutes;
}
