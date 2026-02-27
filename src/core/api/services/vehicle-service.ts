import type { PaginatedResponse } from "@/core/types/common";
import type { Vehicle } from "@/core/types/vehicle";
import { apiClient } from "../apiClient";

export enum VehicleApi {
	Customers = "/customers",
}

type CustomerIdentity = { id: string };
const CUSTOMER_PAGE_SIZE = 200;

async function getAllCustomerIds(pageSize = CUSTOMER_PAGE_SIZE): Promise<string[]> {
	const firstPage = await apiClient.get<PaginatedResponse<CustomerIdentity>>({
		url: VehicleApi.Customers,
		params: { page: 0, size: pageSize },
	});

	const remainingPages = Array.from({ length: Math.max(0, firstPage.totalPages - 1) }, (_, index) => index + 1);
	const nextPages = await Promise.all(
		remainingPages.map((page) =>
			apiClient.get<PaginatedResponse<CustomerIdentity>>({
				url: VehicleApi.Customers,
				params: { page, size: pageSize },
			}),
		),
	);

	return [firstPage, ...nextPages].flatMap((response) => response.content.map((customer) => customer.id));
}

async function getCustomerVehicles(customerId: string): Promise<Vehicle[]> {
	try {
		return await apiClient.get<Vehicle[]>({
			url: `${VehicleApi.Customers}/${customerId}/vehicles`,
		});
	} catch {
		return [];
	}
}

const getVehicleList = async (): Promise<Vehicle[]> => {
	const customerIds = await getAllCustomerIds();
	if (customerIds.length === 0) return [];

	const vehicleGroups = await Promise.all(customerIds.map(getCustomerVehicles));

	const seen = new Set<string>();
	return vehicleGroups.flat().filter((vehicle) => {
		if (seen.has(vehicle.id)) return false;
		seen.add(vehicle.id);
		return true;
	});
};

export default {
	getVehicleList,
};
