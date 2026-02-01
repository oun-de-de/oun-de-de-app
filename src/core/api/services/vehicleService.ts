import type { Vehicle } from "@/core/types/vehicle";
import { apiClient } from "../apiClient";

export enum VehicleApi {
	List = "/vehicles",
}

const getVehicleList = (): Promise<Vehicle[]> =>
	apiClient.get<Vehicle[]>({
		url: VehicleApi.List,
	});

export default {
	getVehicleList,
};
