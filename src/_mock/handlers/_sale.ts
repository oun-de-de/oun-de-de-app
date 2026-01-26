import { http, HttpResponse } from "msw";
import { faker } from "@faker-js/faker";
import { ResultStatus } from "@/core/types/enum";
import type {
	CustomerFilter,
	EmployeeFilter,
	WarehouseFilter,
	SaleCategoryFilter,
} from "@/core/domain/sales/entities/sale-filter";
import type { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import type { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import type { Pagination } from "@/core/types/pagination";

const saleCustomers = http.get("/api/sale/customers", () => {
	const mock: CustomerFilter[] = [
		{ id: "1", name: "Customer 1" },
		{ id: "2", name: "Customer 2" },
		{ id: "3", name: "Customer 3" },
	];

	return HttpResponse.json(
		{
			message: "",
			data: mock,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const saleEmployees = http.get("/api/sale/employees", () => {
	const mock: EmployeeFilter[] = [
		{ id: "1", name: "Employee 1" },
		{ id: "2", name: "Employee 2" },
		{ id: "3", name: "Employee 3" },
	];

	return HttpResponse.json(
		{
			message: "",
			data: mock,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const saleWarehouses = http.get("/api/sale/warehouses", () => {
	const mock: WarehouseFilter[] = [
		{ id: "1", name: "Warehouse A" },
		{ id: "2", name: "Warehouse B" },
		{ id: "3", name: "Warehouse C" },
	];

	return HttpResponse.json(
		{
			message: "",
			data: mock,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const saleCategoryFilter = http.get("/api/sale/category-filters", () => {
	const mock: SaleCategoryFilter[] = [
		{ id: "1", name: "General" },
		{ id: "2", name: "Category 1" },
		{ id: "3", name: "Category 2" },
	];

	return HttpResponse.json(
		{
			message: "",
			data: mock,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const saleCategories = http.get("/api/sale/categories", () => {
	const mock: SaleCategory[] = [
		{ name: "NA", id: "na" },
		{ name: "ទឹកកកនឹម", id: "ice-cream" },
		{ name: "ទឹកកកសរសើប", id: "ice-dessert" },
		{ name: "ប្រហុកឡេក", id: "dish-1" },
		{ name: "លីត្រ", id: "liter" },
		{ name: "សំបកបបូរ", id: "shell" },
	];

	return HttpResponse.json(
		{
			message: "",
			data: mock,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const saleGetProduct = http.get("/api/sale/products/:id", ({ params }) => {
	const { id } = params;
	const product = {
		id: id,
		name: faker.commerce.productName() + " " + id,
		price: Number(faker.commerce.price({ min: 50, max: 500 })),
		currency: "USD",
		imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 200, grayscale: false }),
	};

	return HttpResponse.json(
		{
			message: "",
			data: product,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

const saleGetProducts = http.get("/api/sale/products", ({ request }) => {
	const url = new URL(request.url);
	const page = parseInt(url.searchParams.get("page") ?? "1");
	const limit = parseInt(url.searchParams.get("limit") ?? "10");
	const search = url.searchParams.get("search") ?? "";
	const customer = url.searchParams.get("customer") ?? "";
	const employee = url.searchParams.get("employee") ?? "";
	const warehouse = url.searchParams.get("warehouse") ?? "";
	const saleCategory = url.searchParams.get("saleCategory") ?? "";
	const date = url.searchParams.get("date") ?? "";

	// Fake total count for pagination (e.g. 123)
	const total = 123;
	const pageCount = Math.ceil(total / limit);
	const startIndex = (page - 1) * limit;

	// Helper to generate filter object
	const makeFilter = (id: string, name: string) => ({ id, name });

	// Generate fake products for this page, with filter fields
	let list: SaleProduct[] = Array.from({ length: Math.min(limit, total - startIndex) }, (_, i) => {
		const id = (startIndex + i + 1).toString();
		const name = faker.commerce.productName() + " " + id;
		return {
			id,
			name,
			price: Number(faker.commerce.price({ min: 50, max: 500 })),
			currency: "USD",
			imageUrl: faker.image.urlPicsumPhotos({ width: 200, height: 200, grayscale: false }),
			date: date || faker.date.recent({ days: 30 }).toLocaleDateString("en-GB"),
			customer: customer ? makeFilter(customer, `Customer ${customer}`) : makeFilter(id, `Customer ${id}`),
			employee: employee ? makeFilter(employee, `Employee ${employee}`) : makeFilter(id, `Employee ${id}`),
			warehouse: warehouse ? makeFilter(warehouse, `Warehouse ${warehouse}`) : makeFilter(id, `Warehouse ${id}`),
			saleCategory: saleCategory
				? makeFilter(saleCategory, `Category ${saleCategory}`)
				: makeFilter(id, `Category ${id}`),
		};
	});

	// Filter by search (name)
	if (search) {
		list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
	}

	// Filter by customer, employee, warehouse, saleCategory, date if provided
	if (customer) {
		list = list.filter((p) => p.customer?.id === customer);
	}
	if (employee) {
		list = list.filter((p) => p.employee?.id === employee);
	}
	if (warehouse) {
		list = list.filter((p) => p.warehouse?.id === warehouse);
	}
	if (saleCategory) {
		list = list.filter((p) => p.saleCategory?.id === saleCategory);
	}
	if (date) {
		list = list.filter((p) => p.date === date);
	}

	const pagination: Pagination<SaleProduct> = {
		list,
		page,
		pageSize: limit,
		pageCount,
		total,
	};

	return HttpResponse.json(
		{
			message: "",
			data: pagination,
			status: ResultStatus.SUCCESS,
		},
		{
			status: 200,
		},
	);
});

export {
	saleCustomers,
	saleEmployees,
	saleWarehouses,
	saleCategoryFilter,
	saleCategories,
	saleGetProduct,
	saleGetProducts,
};
