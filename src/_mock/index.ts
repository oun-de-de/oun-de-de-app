import { setupWorker } from "msw/browser";
import { createCustomerVehicle, customerList, getCustomerVehicleList } from "./handlers/_customer";
import { dailyIncomePos, dailyReport, financialOverview, performance } from "./handlers/_dashboard";
import { mockTokenExpired } from "./handlers/_demo";
import {
	createEmployee as createEmployeeMock,
	employeeList,
	updateEmployee as updateEmployeeMock,
} from "./handlers/_employee";
import { menuList } from "./handlers/_menu";
import { createProduct, deleteProduct, getProductById, getProductList, updateProduct } from "./handlers/_product";
import {
	saleCategories,
	saleCategoryFilter,
	saleCustomers,
	saleEmployees,
	saleGetProducts,
	saleWarehouses,
} from "./handlers/_sale";
import { refresh, signIn, userList } from "./handlers/_user";
import { createVehicle, deleteVehicle, getVehicleById, getVehicleList, updateVehicle } from "./handlers/_vehicle";

const handlers = [
	signIn,
	refresh,
	userList,
	mockTokenExpired,
	menuList,
	customerList,
	getCustomerVehicleList,
	createCustomerVehicle,
	dailyIncomePos,
	financialOverview,
	performance,
	dailyReport,
	saleCustomers,
	saleEmployees,
	saleWarehouses,
	saleCategoryFilter,
	saleCategories,
	saleGetProducts,
	getVehicleList,
	getVehicleById,
	createVehicle,
	updateVehicle,
	deleteVehicle,
	getProductList,
	getProductById,
	createProduct,
	updateProduct,
	deleteProduct,
	employeeList,
	createEmployeeMock,
	updateEmployeeMock,
];

const worker = setupWorker(...handlers);

export { worker };
