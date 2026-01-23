import { Navigate, type RouteObject } from "react-router";
import { authRoutes } from "./auth";
import { dashboardRoutes } from "./dashboard";
import { mainRoutes } from "./main";
import { saleRoutes } from "./sale/new";

export const routesSection: RouteObject[] = [
	// Auth
	...authRoutes,
	// Dashboard
	...dashboardRoutes,
	// Sale New
	...saleRoutes,
	// Main
	...mainRoutes,
	// No Match
	{ path: "*", element: <Navigate to="/404" replace /> },
];
