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

const getUnitList = () => {
	return apiClient.get<Unit[]>({ url: SettingApi.Units });
};

const createUnit = (unit: CreateUnit) => {
	return apiClient.post<Unit>({ url: SettingApi.Units, data: unit });
};

export default {
	getWarehouseList,
	createWarehouse,
	getUnitList,
	createUnit,
};
