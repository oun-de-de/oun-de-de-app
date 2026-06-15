import type { PagePaginatedResponse } from "@/core/types/common";
import type {
	Coupon,
	CouponWeightRecordResult,
	CreateCouponRequest,
	DeleteCouponRequest,
	UpdateCouponRequest,
} from "@/core/types/coupon";
import type { Pagination } from "@/core/types/pagination";
import { mapPagePaginatedResponseToPagination } from "@/core/utils/pagination";
import { apiClient } from "../apiClient";

export enum CouponApi {
	List = "/coupons",
	Create = "/coupons",
}

const getCouponWeightRecordsUrl = (couponId: string) => `/coupons/${couponId}/weight-records`;

const getCouponList = (params?: {
	page?: number;
	limit?: number;
	customerId?: string;
	sort?: string;
}): Promise<Pagination<Coupon>> =>
	apiClient
		.get<PagePaginatedResponse<Coupon>>({
			url: CouponApi.List,
			params: {
				page: params?.page ? params.page - 1 : 0,
				size: params?.limit,
				customer_id: params?.customerId,
				sort: params?.sort || "couponNo,desc",
			},
		})
		.then(mapPagePaginatedResponseToPagination);

const getCoupon = async (couponId: string): Promise<Coupon | null> => {
	const response = await getCouponList({ page: 1, limit: 10000 });
	return response.list.find((coupon) => coupon.id === couponId) ?? null;
};

const createCoupon = (coupon: CreateCouponRequest) => apiClient.post<Coupon>({ url: CouponApi.Create, data: coupon });

const updateCouponByCouponNo = (couponNo: number, data: UpdateCouponRequest): Promise<Coupon> =>
	apiClient.put<Coupon>({
		url: `${CouponApi.List}/by-coupon-no/${couponNo}`,
		data,
	});

const deleteCouponByCouponNo = (couponNo: number, data: DeleteCouponRequest): Promise<Record<string, unknown>> =>
	apiClient.delete<Record<string, unknown>>({
		url: `${CouponApi.List}/by-coupon-no/${couponNo}`,
		data,
	});

const getCouponWeightRecords = (couponId: string) =>
	apiClient.get<CouponWeightRecordResult[]>({
		url: getCouponWeightRecordsUrl(couponId),
	});

export default {
	getCouponList,
	getCoupon,
	createCoupon,
	updateCouponByCouponNo,
	deleteCouponByCouponNo,
	getCouponWeightRecords,
};
