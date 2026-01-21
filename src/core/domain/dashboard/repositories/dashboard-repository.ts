import { DashboardApi } from "@/core/api/services/dashboardService";
import { FilterData } from "../entities/filter";
import LocalStorageService from "@/core/services/storages/local-storage";
import { BehaviorSubject, Observable } from "rxjs";

/**
 * Repository interface for Dashboard
 */
export type DashboardRepository = {
	selectedFilter?: FilterData;
	listFilterData: Record<string, FilterData>;

	getFiltersByType(type: string): Promise<FilterData[]>;
	selectFilter(filter: FilterData): void;
	getSelectedFilter(): FilterData | undefined;

	readonly selectedFilter$: Observable<FilterData | undefined>;
};

class DashboardRepositoryImpl implements DashboardRepository {
	listFilterData: Record<string, FilterData> = {};
	private readonly _selectedFilter$: BehaviorSubject<FilterData | undefined>;

	constructor(
		private api: DashboardApi,
		private storageKey: string,
	) {
		this._selectedFilter$ = new BehaviorSubject<FilterData | undefined>(
			LocalStorageService.loadOrNull<FilterData>(storageKey) ?? undefined,
		);
	}

	get selectedFilter$() {
		return this._selectedFilter$.asObservable();
	}

	get selectedFilter(): FilterData | undefined {
		return this._selectedFilter$.value;
	}

	async getFiltersByType(type: string): Promise<FilterData[]> {
		const result = await this.api.getFiltersByType(type);

		if (!result || result.length === 0) {
			throw new Error("Filter list is empty");
		}

		this.updateItems(result);

		if (!this._selectedFilter$.value) {
			this.selectFilter(result[0]);
		}

		return result;
	}

	private updateItems(items: FilterData[]) {
		const map = { ...this.listFilterData };
		for (const item of items) {
			map[item.id] = item;
		}
		this.listFilterData = map;
	}

	selectFilter(filter: FilterData): void {
		LocalStorageService.save(this.storageKey, filter);
		this.updateItems([filter]);
		this._selectedFilter$.next(filter);
	}

	getSelectedFilter(): FilterData | undefined {
		return this._selectedFilter$.value;
	}
}
export { DashboardRepositoryImpl };
