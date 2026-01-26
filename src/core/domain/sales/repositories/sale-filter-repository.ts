import { CustomerFilter, EmployeeFilter, WarehouseFilter, SaleCategoryFilter } from "../entities/sale-filter";
import { SaleCategory } from "../entities/sale-category";
import { SaleApi } from "@/core/api/services/saleService";

/**
 * Repository interface for Sale Filters
 */
export type SaleFilterRepository = {
	getCustomerFilters(): Promise<CustomerFilter[]>;
	getEmployeeFilters(): Promise<EmployeeFilter[]>;
	getWarehouseFilters(): Promise<WarehouseFilter[]>;
	getSaleCategoryFilters(): Promise<SaleCategoryFilter[]>;
	getCategories(): Promise<SaleCategory[]>;
};

class SaleFilterRepositoryImpl implements SaleFilterRepository {
	constructor(private api: SaleApi) {}

	async getCustomerFilters(): Promise<CustomerFilter[]> {
		return await this.api.getCustomerFilters();
	}

	async getEmployeeFilters(): Promise<EmployeeFilter[]> {
		return await this.api.getEmployeeFilters();
	}

	async getWarehouseFilters(): Promise<WarehouseFilter[]> {
		return await this.api.getWarehouseFilters();
	}

	async getSaleCategoryFilters(): Promise<SaleCategoryFilter[]> {
		return await this.api.getSaleCategoryFilters();
	}

	async getCategories(): Promise<SaleCategory[]> {
		const result = await this.api.getCategories();
		return result;
	}
}

export { SaleFilterRepositoryImpl };
