import type { PaginatedResponse } from "@/core/types/common";
import type { Coupon, CreateCouponRequest } from "@/core/types/coupon";
import type { Pagination } from "@/core/types/pagination";
import { mapPaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum CouponApi {
	List = "/coupons",
	Create = "/coupons",
}

const getCouponList = (params?: {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
}): Promise<Pagination<Coupon>> =>
	apiClient
		.get<PaginatedResponse<Coupon>>({
			url: CouponApi.List,
			params: {
				page: params?.page ? params.page - 1 : 0,
				size: params?.limit,
				search: params?.search,
				status: params?.status,
			},
		})
		.then(mapPaginatedResponseToPagination);

const createCoupon = (coupon: CreateCouponRequest) => apiClient.post<Coupon>({ url: CouponApi.Create, data: coupon });

export default {
	getCouponList,
	createCoupon,
};
