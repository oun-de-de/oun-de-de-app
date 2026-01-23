import { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import { SaleFilters } from "@/core/domain/sales/entities/sale-filter";
import { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import { BaseStore } from "@/core/types/base-store";
import { Pagination } from "@/core/types/pagination";
import { SaleProductState } from "./sale-product-state";

type SaleProductActions = {
	loadFirstPage: () => Promise<Pagination<SaleProduct>>;
	loadMorePage: (page: number) => Promise<Pagination<SaleProduct>>;
	reloadPage: () => Promise<Pagination<SaleProduct>>;
	searchProducts: (query: string) => Promise<void>;
	filterProducts: (filters: SaleFilters) => Promise<void>;
	selectCategories: (categories: SaleCategory[]) => Promise<void>;
};

export interface SaleProductStore extends BaseStore<SaleProductState, SaleProductActions> {
	state: SaleProductState;
	actions: {
		loadFirstPage: () => Promise<Pagination<SaleProduct>>;
		loadMorePage: (page: number) => Promise<Pagination<SaleProduct>>;
		reloadPage: () => Promise<Pagination<SaleProduct>>;
		searchProducts: (query: string) => Promise<void>;
		filterProducts: (filters: SaleFilters) => Promise<void>;
		selectCategories: (categories: SaleCategory[]) => Promise<void>;
	};
}
