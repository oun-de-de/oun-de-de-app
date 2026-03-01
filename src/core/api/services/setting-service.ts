import type { CreateUnit, CreateWarehouse, Unit, Warehouse } from "@/core/types/setting";
import { apiClient } from "../apiClient";

export enum SettingApi {
	Warehouses = "/settings/warehouses",
	Units = "/settings/units",
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

export default {
	getWarehouseList,
	createWarehouse,
	updateWarehouse,
	getUnitList,
	createUnit,
	updateUnit,
};
