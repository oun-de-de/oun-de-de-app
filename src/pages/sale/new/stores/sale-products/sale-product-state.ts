// Re-export all state modules for convenience
export * from "./states/filter-state";
export * from "./states/load-first-state";
export * from "./states/load-more-state";
export * from "./states/reload-state";
export * from "./states/search-state";
export * from "./states/select-categories-state";
import { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import { defaultSaleFilters, SaleFilters } from "@/core/domain/sales/entities/sale-filter";
import { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import { emptyPagination, Pagination } from "@/core/types/pagination";
import { BaseState } from "@/core/types/state";

type SaleProductType =
	| "InitialState"
	| "LoadFirstLoadingState"
	| "LoadFirstListSuccessState"
	| "LoadFirstListErrorState"
	| "LoadMoreLoadingState"
	| "LoadMoreListSuccessState"
	| "LoadMoreListErrorState"
	| "ReloadListLoadingState"
	| "ReloadListSuccessState"
	| "ReloadListErrorState"
	| "SearchLoadingState"
	| "SearchSuccessState"
	| "SearchErrorState"
	| "FilterLoadingState"
	| "FilterSuccessState"
	| "FilterErrorState"
	| "SelectCategoriesLoadingState"
	| "SelectCategoriesSuccessState"
	| "SelectCategoriesErrorState";

export type SaleProductState = BaseState<SaleProductType> & {
	variant: string;
	pagination: Pagination<SaleProduct>;
	filters: SaleFilters;
	search?: string;
	selectedCategories: SaleCategory[];
};

export const SaleProductInitialState = ({
	variant,
	search,
}: {
	variant: string;
	search?: string;
}): SaleProductState => ({
	variant,
	type: "InitialState",
	pagination: emptyPagination<SaleProduct>(),
	filters: defaultSaleFilters,
	search,
	selectedCategories: [],
});

export const _SaleProductState = ({
	state,
	type,
	pagination,
	filters,
	search,
	selectedCategories,
}: {
	state: SaleProductState;
	type: SaleProductType;
	pagination?: Pagination<SaleProduct>;
	filters?: SaleFilters;
	search?: string;
	selectedCategories?: SaleCategory[];
}): SaleProductState => ({
	variant: state.variant,
	type,
	pagination: pagination ?? state.pagination,
	filters: filters ?? state.filters,
	search: search ?? state.search,
	selectedCategories: selectedCategories ?? state.selectedCategories,
});
