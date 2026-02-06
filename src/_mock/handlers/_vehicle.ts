import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import type { Vehicle } from "@/core/types/vehicle";

const getVehicleList = http.get("/api/v1/vehicles", async () => {
	const vehicles: Vehicle[] = Array.from({ length: 15 }).map(() => ({
		id: faker.string.uuid(),
		vehicleType: faker.helpers.arrayElement(["truck", "tuk_tuk", "others"]),
		licensePlate: faker.vehicle.vrm(),
	}));

	return HttpResponse.json(vehicles, { status: 200 });
});

const getVehicleById = http.get("/api/v1/vehicles/:id", async ({ params }) => {
	const { id } = params;
	const vehicle: Vehicle = {
		id: id as string,
		vehicleType: faker.helpers.arrayElement(["truck", "tuk_tuk", "others"]),
		licensePlate: faker.vehicle.vrm(),
	};

	return HttpResponse.json(vehicle, { status: 200 });
});

const createVehicle = http.post("/api/v1/vehicles", async () => {
	return HttpResponse.json(
		{
			id: faker.string.uuid(),
		},
		{ status: 201 },
	);
});

const updateVehicle = http.put("/api/v1/vehicles/:id", async () => {
	return HttpResponse.json(
		{
			id: faker.string.uuid(),
		},
		{ status: 200 },
	);
});

const deleteVehicle = http.delete("/api/v1/vehicles/:id", async () => {
	return HttpResponse.json(true, { status: 200 });
});

export { getVehicleList, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
