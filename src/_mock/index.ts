import { setupWorker } from "msw/browser";
import { mockTokenExpired } from "./handlers/_demo";
import {
	dailyIncomePos,
	customerInfo,
	performance,
	dashboardFilters,
	dailyIncomeAccounting,
} from "./handlers/_dashboard";
import { menuList } from "./handlers/_menu";
import { signIn, refresh, userList } from "./handlers/_user";
import { customerList } from "./handlers/_customer";
import {
	saleCustomers,
	saleEmployees,
	saleWarehouses,
	saleCategoryFilter,
	saleCategories,
	saleGetProduct,
	saleGetProducts,
} from "./handlers/_sale";

const handlers = [
	signIn,
	refresh,
	userList,
	mockTokenExpired,
	menuList,
	customerList,
	dailyIncomePos,
	customerInfo,
	performance,
	dashboardFilters,
	dailyIncomeAccounting,
	saleCustomers,
	saleEmployees,
	saleWarehouses,
	saleCategoryFilter,
	saleCategories,
	saleGetProduct,
	saleGetProducts,
];

const worker = setupWorker(...handlers);

export { worker };
