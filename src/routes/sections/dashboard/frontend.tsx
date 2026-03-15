import { Navigate, type RouteObject } from "react-router";
import ReportDetailTemplate from "@/pages/dashboard/reports/report-detail";
import { Component } from "../../utils/utils";

const createLoanRoutes = (basePath: "dashboard/borrow" | "dashboard/loan"): RouteObject[] => [
	{ path: basePath, element: Component("/pages/dashboard/borrow") },
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
		{
			path: "dashboard/customers/receipt-print-preview",
			element: Component("/pages/dashboard/customers/receipt-print-preview"),
		},
		{ path: "dashboard/employees", element: Component("/pages/dashboard/employees") },
		{ path: "dashboard/employees/create", element: Component("/pages/dashboard/employees/create") },
		{ path: "dashboard/employees/edit/:id", element: Component("/pages/dashboard/employees/edit") },
		{ path: "dashboard/invoice", element: Component("/pages/dashboard/invoice") },
		{ path: "dashboard/invoice/export-preview", element: Component("/pages/dashboard/invoice/export-preview") },
		{ path: "dashboard/vendors", element: Component("/pages/dashboard/vendors") },
		{ path: "dashboard/products", element: Component("/pages/dashboard/products") },
		{ path: "dashboard/products/create", element: Component("/pages/dashboard/products/create") },
		{ path: "dashboard/products/edit/:id", element: Component("/pages/dashboard/products/edit") },
		{ path: "dashboard/coupons", element: Component("/pages/dashboard/coupons") },
		{ path: "dashboard/coupons/create", element: Component("/pages/dashboard/coupons/create") },
		{ path: "dashboard/accounting-center", element: Component("/pages/dashboard/accounting-center") },
		{ path: "dashboard/accounting-center/create", element: Component("/pages/dashboard/accounting-center/create") },
		{ path: "dashboard/cash-transactions", element: <Navigate to="/dashboard/accounting-center" replace /> },
		{
			path: "dashboard/cash-transactions/create",
			element: <Navigate to="/dashboard/accounting-center/create" replace />,
		},
		{ path: "dashboard/accounting", element: Component("/pages/dashboard/accounting") },
		{ path: "dashboard/accounting/create-journal", element: Component("/pages/dashboard/accounting/create-journal") },
		{ path: "dashboard/accounting/create-expense", element: Component("/pages/dashboard/accounting/create-expense") },
		{ path: "dashboard/accounting/create-revenue", element: Component("/pages/dashboard/accounting/create-revenue") },
		{
			path: "dashboard/accounting/create-chart-account",
			element: Component("/pages/dashboard/accounting/create-chart-account"),
		},
		{
			path: "dashboard/accounting/edit-chart-account/:id",
			element: Component("/pages/dashboard/accounting/edit-chart-account"),
		},
		{ path: "dashboard/reports", element: Component("/pages/dashboard/reports") },
		{ path: "dashboard/reports/detail/:slug", element: <ReportDetailTemplate /> },
		{ path: "dashboard/settings", element: Component("/pages/dashboard/settings") },
		{ path: "dashboard/audit-log", element: Component("/pages/dashboard/audit-log") },
		{ path: "dashboard/borrow", element: Component("/pages/dashboard/borrow") },
		{ path: "dashboard/borrow/payment", element: Component("/pages/dashboard/borrow/payment") },
		{ path: "dashboard/borrow/:id", element: Component("/pages/dashboard/borrow/detail") },
		...createLoanRoutes("dashboard/loan"),
		{ path: "dashboard/equipment", element: Component("/pages/dashboard/equipment") },
		{ path: "dashboard/equipment/print-preview", element: Component("/pages/dashboard/equipment/export-preview") },
		{ path: "dashboard/equipment/:id", element: Component("/pages/dashboard/equipment/detail") },
	];
	return frontendDashboardRoutes;
}
