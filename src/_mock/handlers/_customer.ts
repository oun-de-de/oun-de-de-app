import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import type { Customer } from "@/core/types/customer";

const customerList = http.get("/api/v1/customers", async () => {
	const customers: Customer[] = Array.from({ length: 20 }).map(() => ({
		id: faker.string.uuid(),
		registerDate: faker.date.past().toISOString(),
		code: faker.string.alphanumeric(6).toUpperCase(),
		name: faker.person.fullName(),
		status: faker.datatype.boolean(),
		customerType: faker.helpers.arrayElement(["Regular", "VIP", "New"]),
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

export { customerList };
