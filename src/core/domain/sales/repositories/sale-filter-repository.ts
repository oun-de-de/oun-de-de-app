import {
	CustomerFilter,
	EmployeeFilter,
	SaleFilters,
	WarehouseFilter,
	SaleCategoryFilter,
} from "../entities/sale-filter";
import { SaleCategory } from "../entities/sale-category";
import LocalStorageService from "@/core/services/storages/local-storage";
import { BehaviorSubject, Observable } from "rxjs";
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

	selectFilter(filter: SaleFilters): void;
	getSelectedFilter(): SaleFilters | undefined;
	selectCategories(categories: SaleCategory[]): void;
	getSelectedCategories(): SaleCategory[] | undefined;

	readonly selectedFilter$: Observable<SaleFilters | undefined>;
	readonly selectedCategory$: Observable<SaleCategory[] | undefined>;
};

class SaleFilterRepositoryImpl implements SaleFilterRepository {
	private readonly _selectedFilter$: BehaviorSubject<SaleFilters | undefined>;
	private readonly _selectedCategory$: BehaviorSubject<SaleCategory[] | undefined>;

	constructor(
		private api: SaleApi,
		private filtersStorageKey: string,
		private categoriesStorageKey: string,
	) {
		this._selectedFilter$ = new BehaviorSubject<SaleFilters | undefined>(
			LocalStorageService.loadOrNull<SaleFilters>(filtersStorageKey) ?? undefined,
		);
		this._selectedCategory$ = new BehaviorSubject<SaleCategory[] | undefined>(
			LocalStorageService.loadOrNull<SaleCategory[]>(categoriesStorageKey) ?? undefined,
		);
	}

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

	get selectedFilter$() {
		return this._selectedFilter$.asObservable();
	}

	get selectedCategory$() {
		return this._selectedCategory$.asObservable();
	}

	get selectedFilter(): SaleFilters | undefined {
		return this._selectedFilter$.value;
	}

	get selectedCategory(): SaleCategory[] | undefined {
		return this._selectedCategory$.value;
	}

	async getCategories(): Promise<SaleCategory[]> {
		const result = await this.api.getCategories();
		return result;
	}

	selectFilter(filter: SaleFilters): void {
		LocalStorageService.save(this.filtersStorageKey, filter);
		this._selectedFilter$.next(filter);
	}

	getSelectedFilter(): SaleFilters | undefined {
		return this._selectedFilter$.value;
	}

	selectCategories(categories: SaleCategory[]): void {
		LocalStorageService.save(this.categoriesStorageKey, categories);
		this._selectedCategory$.next(categories);
	}

	getSelectedCategories(): SaleCategory[] | undefined {
		return this._selectedCategory$.value;
	}
}

export { SaleFilterRepositoryImpl };
