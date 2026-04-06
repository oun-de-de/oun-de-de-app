import type {
	CreateCurrency,
	CreateSupplier,
	CreateUnit,
	CreateWarehouse,
	Currency,
	Supplier,
	Unit,
	Warehouse,
} from "@/core/types/setting";
import { apiClient } from "../apiClient";

export enum SettingApi {
	Warehouses = "/settings/warehouses",
	Units = "/settings/units",
	Currencies = "/settings/currencies",
	Suppliers = "/settings/suppliers",
}

const getWarehouseList = () => {
	return apiClient.get<Warehouse[]>({ url: SettingApi.Warehouses });
};

const createWarehouse = (warehouse: CreateWarehouse) => {
	return apiClient.post<Warehouse>({ url: SettingApi.Warehouses, data: warehouse });
};

const updateWarehouse = (warehouseId: string, warehouse: CreateWarehouse) => {
	return apiClient.put<Warehouse>({ url: `${SettingApi.Warehouses}/${warehouseId}`, data: warehouse });
};

const getUnitList = () => {
	return apiClient.get<Unit[]>({ url: SettingApi.Units });
};

const createUnit = (unit: CreateUnit) => {
	return apiClient.post<Unit>({ url: SettingApi.Units, data: unit });
};

const updateUnit = (unitId: string, unit: CreateUnit) => {
	return apiClient.put<Unit>({ url: `${SettingApi.Units}/${unitId}`, data: unit });
};

const getCurrencyList = () => {
	return apiClient.get<Currency[]>({ url: SettingApi.Currencies });
};

const createCurrency = (currency: CreateCurrency) => {
	return apiClient.post<Currency>({ url: SettingApi.Currencies, data: currency });
};

const getSupplierList = () => {
	return apiClient.get<Supplier[]>({ url: SettingApi.Suppliers });
};

const createSupplier = (supplier: CreateSupplier) => {
	return apiClient.post<Supplier>({ url: SettingApi.Suppliers, data: supplier });
};

const updateSupplier = (supplierId: string, supplier: CreateSupplier) => {
	return apiClient.put<Supplier>({ url: `${SettingApi.Suppliers}/${supplierId}`, data: supplier });
};

export default {
	getWarehouseList,
	createWarehouse,
	updateWarehouse,
	getUnitList,
	createUnit,
	updateUnit,
	getCurrencyList,
	createCurrency,
	getSupplierList,
	createSupplier,
	updateSupplier,
};
