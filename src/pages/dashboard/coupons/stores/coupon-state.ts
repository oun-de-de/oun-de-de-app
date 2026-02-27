import type { BaseState } from "@/core/types/state";
import type { Coupon } from "@/core/types/coupon";

type CouponStateType =
	| "InitialState"
	| "GetListLoadingState"
	| "GetListSuccessState"
	| "GetListErrorState"
	| "UpdateState";

export type CouponState = BaseState<CouponStateType> & {
	list: Coupon[];
	page: number;
	pageSize: number;
	total: number;
	pageCount: number;
	searchValue: string;
	typeFilter: string;
	fieldFilter: string;
};

export const CouponInitialState = (): CouponState => ({
	type: "InitialState",
	list: [],
	page: 1,
	pageSize: 10,
	total: 0,
	pageCount: 1,
	searchValue: "",
	typeFilter: "all",
	fieldFilter: "all",
});

export const _CouponState = ({
	state,
	type,
	list,
	page,
	pageSize,
	total,
	pageCount,
	searchValue,
	typeFilter,
	fieldFilter,
}: {
	state: CouponState;
	type: CouponStateType;
	list?: Coupon[];
	page?: number;
	pageSize?: number;
	total?: number;
	pageCount?: number;
	searchValue?: string;
	typeFilter?: string;
	fieldFilter?: string;
}): CouponState => ({
	...state,
	type,
	list: list ?? state.list,
	page: page ?? state.page,
	pageSize: pageSize ?? state.pageSize,
	total: total ?? state.total,
	pageCount: pageCount ?? state.pageCount,
	searchValue: searchValue ?? state.searchValue,
	typeFilter: typeFilter ?? state.typeFilter,
	fieldFilter: fieldFilter ?? state.fieldFilter,
});
