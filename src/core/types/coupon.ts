import type { Vehicle } from "./vehicle";

export interface WeightRecord {
	id?: string;
	productName: string | null;
	unit: string | null;
	pricePerProduct: number | null;
	quantityPerProduct: number | null;
	quantity: number | null;
	weight: number | null;
	outTime: string;
	memo: string | null;
	manual: boolean;
}

export interface CouponEmployee {
	id: string;
	username: string;
	firstName: string | null;
	lastName: string | null;
}

export interface Coupon {
	id: string;
	date: string;
	driverName: string;
	remark: string;
	vehicle: Vehicle;
	employee: CouponEmployee;
	weightRecords: WeightRecord[];
	couponNo: number | null;
	couponId: number | null;
	accNo: string | null;
	delAccNo: string | null;
	delDate: string | null;
}

export interface CreateCouponRequest {
	vehicleId: string;
	driverName?: string;
	employeeId: string;
	remark?: string;
	weightRecords: CreateWeightRecordRequest[];
	couponNo?: number;
	couponId?: number;
	accNo?: string;
	delAccNo?: string;
	delDate?: string;
}

export interface CreateWeightRecordRequest {
	productName?: string | null;
	unit?: string | null;
	pricePerProduct?: number | null;
	quantityPerProduct?: number | null;
	quantity?: number | null;
	weight?: number | null;
	outTime?: string;
	memo?: string | null;
	manual?: boolean;
}
