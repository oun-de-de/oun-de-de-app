import LoginAuthGuard from "@/routes/components/login-auth-guard";
import { RouteObject } from "react-router";
import { getFrontendSaleRoutes } from "./frontend";
import SaleLayout from "@/layouts/sale/new";

const getRoutes = (): RouteObject[] => {
	return getFrontendSaleRoutes();
};

export const saleRoutes: RouteObject[] = [
	{
		element: (
			<LoginAuthGuard>
				<SaleLayout />
			</LoginAuthGuard>
		),
		children: [...getRoutes()],
	},
];
