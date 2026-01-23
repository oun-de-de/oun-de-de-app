import type { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import type { FailureType } from "@/core/types/failure";
import type { Pagination } from "@/core/types/pagination";
import type { ErrorState } from "@/core/types/state";

import { _SaleProductState, type SaleProductState } from "../sale-product-state";

export const SaleProductSearchLoadingState = (state: SaleProductState, search: string): SaleProductState =>
	_SaleProductState({
		state,
		type: "SearchLoadingState",
		search,
	});

export const SaleProductSearchSuccessState = (
	state: SaleProductState,
	pagination: Pagination<SaleProduct>,
): SaleProductState =>
	_SaleProductState({
		state,
		type: "SearchSuccessState",
		pagination,
	});

export const SaleProductSearchErrorState = (
	state: SaleProductState,
	error: FailureType,
): SaleProductState & ErrorState => ({
	..._SaleProductState({
		state,
		type: "SearchErrorState",
	}),
	error,
});
