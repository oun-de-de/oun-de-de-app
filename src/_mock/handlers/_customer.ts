import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import type { Customer } from "@/core/types/customer";
import type { Vehicle } from "@/core/types/vehicle";

const customerList = http.get("/api/v1/customers", async () => {
	const customers: Customer[] = Array.from({ length: 20 }).map(() => ({
		id: faker.string.uuid(),
		registerDate: faker.date.past().toISOString(),
		code: faker.string.alphanumeric(6).toUpperCase(),
		name: faker.person.fullName(),
		status: faker.datatype.boolean(),
		referredBy: faker.helpers.arrayElement([faker.string.uuid(), undefined]),
		defaultPrice: faker.commerce.price(),
		warehouse: faker.location.city(),
		memo: faker.lorem.sentence(),
		profileUrl: faker.image.avatar(),
		shopBannerUrl: faker.image.urlLoremFlickr(),
		employeeId: faker.string.uuid(),
		telephone: faker.phone.number(),
		email: faker.internet.email(),
		geography: faker.location.country(),
		address: faker.location.streetAddress(),
		location: `${faker.location.latitude()},${faker.location.longitude()}`,
		map: faker.internet.url(),
		billingAddress: faker.location.secondaryAddress(),
		deliveryAddress: faker.location.secondaryAddress(),
		vehicles: [],
	}));

	return HttpResponse.json(customers, { status: 200 });
});

const getCustomerVehicleList = http.get("/api/v1/customers/vehicles/:customerId/vehicles", async () => {
	const vehicles: Vehicle[] = Array.from({ length: 5 }).map(() => ({
		id: faker.string.uuid(),
		vehicleType: faker.helpers.arrayElement(["truck", "tuk_tuk", "others"]),
		licensePlate: faker.vehicle.vrm(),
	}));

	return HttpResponse.json(vehicles, { status: 200 });
});

const createCustomerVehicle = http.post("/api/v1/customers/vehicles/:customerId/vehicles", async () => {
	return HttpResponse.json(
		{
			id: faker.string.uuid(),
			vehicleType: "truck",
			licensePlate: faker.vehicle.vrm(),
		},
		{ status: 201 },
	);
});

export { customerList, getCustomerVehicleList, createCustomerVehicle };
