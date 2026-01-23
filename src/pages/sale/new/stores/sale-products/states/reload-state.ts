import type { SaleProduct } from "@/core/domain/sales/entities/sale-product";
import type { FailureType } from "@/core/types/failure";
import type { Pagination } from "@/core/types/pagination";
import type { ErrorState } from "@/core/types/state";

import { _SaleProductState, type SaleProductState } from "../sale-product-state";

export const SaleProductReloadListLoadingState = (state: SaleProductState): SaleProductState =>
	_SaleProductState({
		state,
		type: "ReloadListLoadingState",
	});

export const SaleProductReloadListSuccessState = (
	state: SaleProductState,
	pagination: Pagination<SaleProduct>,
): SaleProductState =>
	_SaleProductState({
		state,
		type: "ReloadListSuccessState",
		pagination,
	});

export const SaleProductReloadListErrorState = (
	state: SaleProductState,
	error: FailureType,
): SaleProductState & ErrorState => ({
	..._SaleProductState({
		state,
		type: "ReloadListErrorState",
	}),
	error,
});
