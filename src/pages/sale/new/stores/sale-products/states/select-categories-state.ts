import type { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import type { FailureType } from "@/core/types/failure";
import type { ErrorState } from "@/core/types/state";

import { _SaleProductState, type SaleProductState } from "../sale-product-state";
import { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import { copyWithPagination, Pagination } from "@/core/types/pagination";

export const SaleProductSelectCategoriesLoadingState = (
	state: SaleProductState,
	selectedCategories: SaleCategory[],
): SaleProductState =>
	_SaleProductState({
		state,
		type: "SelectCategoriesLoadingState",
		selectedCategories,
	});

export const SaleProductSelectCategoriesSuccessState = (
	state: SaleProductState,
	pagination: Pagination<SaleProduct>,
): SaleProductState =>
	_SaleProductState({
		state,
		type: "SelectCategoriesSuccessState",
		pagination,
	});

export const SaleProductSelectCategoriesErrorState = (
	state: SaleProductState,
	error: FailureType,
): SaleProductState & ErrorState => ({
	..._SaleProductState({
		state,
		type: "SelectCategoriesErrorState",
	}),
	error,
	pagination: copyWithPagination(state.pagination, { error: error.message }),
});
