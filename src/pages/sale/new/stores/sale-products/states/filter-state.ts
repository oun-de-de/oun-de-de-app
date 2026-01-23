import type { SaleFilters } from "@/core/domain/sales/entities/sale-filter";
import type { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import type { FailureType } from "@/core/types/failure";
import type { Pagination } from "@/core/types/pagination";
import type { ErrorState } from "@/core/types/state";

import { _SaleProductState, type SaleProductState } from "../sale-product-state";

export const SaleProductFilterLoadingState = (state: SaleProductState, filters: SaleFilters): SaleProductState =>
	_SaleProductState({
		state,
		type: "FilterLoadingState",
		filters,
	});

export const SaleProductFilterSuccessState = (
	state: SaleProductState,
	pagination: Pagination<SaleProduct>,
): SaleProductState =>
	_SaleProductState({
		state,
		type: "FilterSuccessState",
		pagination,
	});

export const SaleProductFilterErrorState = (
	state: SaleProductState,
	error: FailureType,
): SaleProductState & ErrorState => ({
	..._SaleProductState({
		state,
		type: "FilterErrorState",
	}),
	error,
});
