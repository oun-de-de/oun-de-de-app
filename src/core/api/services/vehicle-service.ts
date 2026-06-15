import type { PagePaginatedResponse } from "@/core/types/common";
import type { Customer } from "@/core/types/customer";
import type { Vehicle } from "@/core/types/vehicle";
import { apiClient } from "../apiClient";

export enum VehicleApi {
	Customers = "/customers",
}

const CUSTOMER_PAGE_SIZE = 200;

async function getCustomerPageWithVehicles(page: number, pageSize: number) {
	return apiClient.get<PagePaginatedResponse<Customer>>({
		url: VehicleApi.Customers,
		params: { page, size: pageSize, load_vehicle: true },
	});
}

const getVehicleList = async (pageSize = CUSTOMER_PAGE_SIZE): Promise<Vehicle[]> => {
	const firstPage = await getCustomerPageWithVehicles(0, pageSize);
	const remainingPages = Array.from({ length: Math.max(0, firstPage.page.totalPages - 1) }, (_, index) => index + 1);
	const settled = await Promise.allSettled(remainingPages.map((page) => getCustomerPageWithVehicles(page, pageSize)));

	const rejected = settled.filter((s) => s.status === "rejected").length;
	if (rejected > 0) {
		console.warn(
			`[getVehicleList] ${rejected}/${settled.length} page(s) failed — returning partial vehicle data. ` +
				`Total vehicles may be incomplete.`,
		);
	}

	const nextPages = settled
		.filter(
			(s): s is PromiseFulfilledResult<Awaited<ReturnType<typeof getCustomerPageWithVehicles>>> =>
				s.status === "fulfilled",
		)
		.map((s) => s.value);

	const seen = new Set<string>();
	return [firstPage, ...nextPages].flatMap((response) =>
		response.content.flatMap((customer) =>
			(customer.vehicles ?? []).filter((vehicle) => {
				if (seen.has(vehicle.id)) return false;
				seen.add(vehicle.id);
				return true;
			}),
		),
	);
};

export default {
	getVehicleList,
};
