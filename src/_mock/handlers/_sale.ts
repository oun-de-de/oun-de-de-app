import { http, HttpResponse } from "msw";
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

const mockProducts: SaleProduct[] = [
	{
		id: "1",
		name: "Product 1",
		price: 100,
		currency: "USD",
		imageUrl: "https://via.placeholder.com/200?text=Product+1",
	},
	{
		id: "2",
		name: "Product 2",
		price: 200,
		currency: "USD",
		imageUrl: "https://via.placeholder.com/200?text=Product+2",
	},
	{
		id: "3",
		name: "Product 3",
		price: 150,
		currency: "USD",
		imageUrl: "https://via.placeholder.com/200?text=Product+3",
	},
	{
		id: "4",
		name: "Product 4",
		price: 250,
		currency: "USD",
		imageUrl: "https://via.placeholder.com/200?text=Product+4",
	},
	{
		id: "5",
		name: "Product 5",
		price: 180,
		currency: "USD",
		imageUrl: "https://via.placeholder.com/200?text=Product+5",
	},
];

const saleGetProduct = http.get("/api/sale/products/:id", ({ params }) => {
	const { id } = params;
	const product = mockProducts.find((p) => p.id === id);

	if (!product) {
		return HttpResponse.json(
			{
				message: "Product not found",
				data: null,
				status: ResultStatus.ERROR,
			},
			{
				status: 404,
			},
		);
	}

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

	// Filter products based on search
	let filtered = mockProducts;
	if (search) {
		filtered = mockProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
	}

	// Pagination
	const total = filtered.length;
	const pageCount = Math.ceil(total / limit);
	const startIndex = (page - 1) * limit;
	const list = filtered.slice(startIndex, startIndex + limit);

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
