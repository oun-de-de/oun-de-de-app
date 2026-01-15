import dashboardService from "@/api/services/dashboardService";
import { FilterData } from "../entities/filter";
import LocalStorageService from "@/api/services/localStorageService";
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

const STORAGE_KEY = "dashboard:selectedFilter";

class DashboardRepositoryImpl implements DashboardRepository {
  listFilterData: Record<string, FilterData> = {};
  private readonly _selectedFilter$ = new BehaviorSubject<
    FilterData | undefined
  >(LocalStorageService.loadOrNull<FilterData>(STORAGE_KEY) ?? undefined);

  get selectedFilter$() {
    return this._selectedFilter$.asObservable();
  }

  get selectedFilter(): FilterData | undefined {
    return this._selectedFilter$.value;
  }

  constructor() {}

  async getFiltersByType(type: string): Promise<FilterData[]> {
    const result = await dashboardService.getFiltersByType(type);
    console.log("getFiltersByType", 1);

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
    LocalStorageService.save(STORAGE_KEY, filter);
    this.updateItems([filter]);

    this._selectedFilter$.next(filter);
  }

  getSelectedFilter(): FilterData | undefined {
    return this._selectedFilter$.value;
  }
}

export { DashboardRepositoryImpl };