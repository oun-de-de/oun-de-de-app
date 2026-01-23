type SaleFilters = {
	date: DateRangeValue;
	customer: CustomerFilter;
	employee: EmployeeFilter;
	warehouse: WarehouseFilter;
	saleCategory: SaleCategoryFilter;
};

type DateRangeValue = { from?: string; to?: string };

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

export type { DateRangeValue, SaleFilters, CustomerFilter, EmployeeFilter, WarehouseFilter, SaleCategoryFilter };
