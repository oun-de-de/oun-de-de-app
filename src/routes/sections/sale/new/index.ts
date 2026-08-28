import type { RouteObject } from "react-router";
import { createElement } from "react";
import SaleLayout from "@/layouts/sale/new";
import LoginAuthGuard from "@/routes/components/login-auth-guard";
import { getFrontendSaleRoutes } from "./frontend";

export const saleRoutes: RouteObject[] = [
	{
		element: createElement(LoginAuthGuard, null, createElement(SaleLayout)),
		children: getFrontendSaleRoutes(),
	},
];
