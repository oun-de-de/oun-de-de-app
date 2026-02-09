import { faker } from "@faker-js/faker";
import { HttpResponse, http } from "msw";
import type { Product } from "@/core/types/product";

const getProductList = http.get("/api/v1/products", async () => {
	const products: Product[] = Array.from({ length: 20 }).map(() => ({
		id: faker.string.uuid(),
		name: faker.commerce.productName(),
		date: faker.date.recent().toISOString(),
		refNo: faker.string.alphanumeric(8).toUpperCase(),
		quantity: faker.number.int({ min: 1, max: 100 }),
		cost: parseFloat(faker.commerce.price()),
		price: parseFloat(faker.commerce.price()),
		unit: faker.helpers.arrayElement(["kg", "g", "l", "ml", "pcs"]),
	}));

	return HttpResponse.json(products, { status: 200 });
});

const getProductById = http.get("/api/v1/products/:id", async ({ params }) => {
	const { id } = params;
	const product: Product = {
		id: id as string,
		name: faker.commerce.productName(),
		date: faker.date.recent().toISOString(),
		refNo: faker.string.alphanumeric(8).toUpperCase(),
		quantity: faker.number.int({ min: 1, max: 100 }),
		cost: parseFloat(faker.commerce.price()),
		price: parseFloat(faker.commerce.price()),
		unit: faker.helpers.arrayElement(["kg", "g", "l", "ml", "pcs"]),
	};

	return HttpResponse.json(product, { status: 200 });
});

const createProduct = http.post("/api/v1/products", async () => {
	return HttpResponse.json(
		{
			id: faker.string.uuid(),
		},
		{ status: 201 },
	);
});

const updateProduct = http.put("/api/v1/products/:id", async () => {
	return HttpResponse.json(
		{
			id: faker.string.uuid(),
		},
		{ status: 200 },
	);
});

const deleteProduct = http.delete("/api/v1/products/:id", async () => {
	return HttpResponse.json(true, { status: 200 });
});

export { getProductList, getProductById, createProduct, updateProduct, deleteProduct };
