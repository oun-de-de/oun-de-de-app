import type { DateFilter, CustomerFilter, EmployeeFilter, WarehouseFilter, SaleCategoryFilter } from "./sale-filter";

export type SaleProduct = {
	id: string | number;
	name: string;
	price: number;
	amount: number;
	currency?: string;
	imageUrl?: string;

	date?: DateFilter;
	customer?: CustomerFilter;
	employee?: EmployeeFilter;
	warehouse?: WarehouseFilter;
	saleCategory?: SaleCategoryFilter;
};

export type { DateFilter, CustomerFilter, EmployeeFilter, WarehouseFilter, SaleCategoryFilter };
