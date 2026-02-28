import { formatDisplayDate } from "@/core/utils/formatters";

type SaleFilters = {
	date?: DateFilter;
	customer?: CustomerFilter;
	employee?: EmployeeFilter;
	warehouse?: WarehouseFilter;
	saleCategory?: SaleCategoryFilter;
};

type DateFilter = string;

type CustomerFilter = {
	id: string;
	name: string;
};

type EmployeeFilter = {
	id: string;
	name: string;
};

type WarehouseFilter = {
	id: string;
	name: string;
};

type SaleCategoryFilter = {
	id: string;
	name: string;
};

export const defaultSaleFilters: SaleFilters = {
	date: formatDisplayDate(new Date().toISOString()),
	customer: undefined,
	employee: undefined,
	warehouse: undefined,
	saleCategory: undefined,
};

export type { DateFilter, SaleFilters, CustomerFilter, EmployeeFilter, WarehouseFilter, SaleCategoryFilter };
