import { Component } from "@/routes/utils/utils";
import type { RouteObject } from "react-router";

export function getFrontendSaleRoutes(): RouteObject[] {
	const frontendDashboardRoutes: RouteObject[] = [
		{ path: "sale/new/cash-sale", element: Component("/pages/sale/new", { variant: "cash-sale" }) },
		{ path: "sale/new/invoice", element: Component("/pages/sale/new", { variant: "invoice" }) },
	];
	return frontendDashboardRoutes;
}
