import type { Coupon } from "@/core/types/coupon";
import { type CouponState, _CouponState } from "../coupon-state";

export const CouponGetListLoadingState = (state: CouponState): CouponState =>
	_CouponState({
		state,
		type: "GetListLoadingState",
	});

export const CouponGetListSuccessState = (
	state: CouponState,
	payload: {
		list: Coupon[];
		total: number;
		pageCount: number;
		page: number;
	},
): CouponState =>
	_CouponState({
		state,
		type: "GetListSuccessState",
		list: payload.list,
		total: payload.total,
		pageCount: payload.pageCount,
		page: payload.page,
	});

export const CouponUpdateState = (state: CouponState, payload: Partial<CouponState>): CouponState =>
	_CouponState({
		state,
		type: "UpdateState",
		...payload,
	});

export const CouponResetState = (): CouponState =>
	_CouponState({
		state: {
			type: "InitialState",
			list: [],
			page: 1,
			pageSize: 10,
			total: 0,
			pageCount: 1,
			searchValue: "",
			typeFilter: "all",
			fieldFilter: "all",
		},
		type: "InitialState",
	});
