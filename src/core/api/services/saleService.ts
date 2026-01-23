import { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import type { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import { MainApi } from "../index";
import type {
	CustomerFilter,
	EmployeeFilter,
	WarehouseFilter,
	SaleCategoryFilter,
} from "@/core/domain/sales/entities/sale-filter";
import type { SaleFilters } from "@/core/domain/sales/entities/sale-filter";
import type { Pagination } from "@/core/types/pagination";

enum SaleApiPath {
	Customers = "/sale/customers",
	Employees = "/sale/employees",
	Warehouses = "/sale/warehouses",
	Categories = "/sale/categories",
	CategoriesFilters = "/sale/category-filters",
	Products = "/sale/products",
	Product = "/sale/products",
}

export interface SaleProductApi {
	getProduct(id: string | number): Promise<SaleProduct>;
	getProducts(params: {
		page: number;
		limit?: number;
		search?: string;
		filters?: SaleFilters;
	}): Promise<Pagination<SaleProduct>>;
}

export interface SaleApi extends SaleProductApi {
	getCustomerFilters(): Promise<CustomerFilter[]>;
	getEmployeeFilters(): Promise<EmployeeFilter[]>;
	getWarehouseFilters(): Promise<WarehouseFilter[]>;
	getSaleCategoryFilters(): Promise<SaleCategoryFilter[]>;
	getCategories(): Promise<SaleCategory[]>;
}

export class SaleApiImpl extends MainApi implements SaleApi {
	async getCustomerFilters(): Promise<CustomerFilter[]> {
		const response = await this.client.get<CustomerFilter[]>(SaleApiPath.Customers);
		return response.body ?? [];
	}

	async getEmployeeFilters(): Promise<EmployeeFilter[]> {
		const response = await this.client.get<EmployeeFilter[]>(SaleApiPath.Employees);
		return response.body ?? [];
	}

	async getWarehouseFilters(): Promise<WarehouseFilter[]> {
		const response = await this.client.get<WarehouseFilter[]>(SaleApiPath.Warehouses);
		return response.body ?? [];
	}

	async getSaleCategoryFilters(): Promise<SaleCategoryFilter[]> {
		const response = await this.client.get<SaleCategoryFilter[]>(SaleApiPath.CategoriesFilters);
		return response.body ?? [];
	}

	async getCategories(): Promise<SaleCategory[]> {
		const response = await this.client.get<SaleCategory[]>(SaleApiPath.Categories);
		return response.body ?? [];
	}

	async getProduct(id: string | number): Promise<SaleProduct> {
		const response = await this.client.get<SaleProduct>(`${SaleApiPath.Product}/${id}`);
		return response.body ?? ({} as SaleProduct);
	}

	async getProducts(params: {
		page: number;
		limit?: number;
		search?: string;
		filters?: SaleFilters;
	}): Promise<Pagination<SaleProduct>> {
		const response = await this.client.get<Pagination<SaleProduct>>(SaleApiPath.Products, {
			queryParameters: {
				page: params.page,
				limit: params.limit,
				search: params.search,
				...params.filters,
			},
		});
		return response.body ?? ({ list: [], total: 0, page: 1, pageSize: 0, pageCount: 0 } as Pagination<SaleProduct>);
	}
}

export default new SaleApiImpl();
