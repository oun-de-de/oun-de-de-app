import type { Vehicle } from "./vehicle";

export interface WeightRecord {
	id?: string;
	productName: string | null;
	unit: string | null;
	pricePerProduct: number | null;
	quantityPerProduct: number | null;
	quantity: number | null;
	weight: number | null;
	amount?: number | null;
	outTime: string;
	memo: string | null;
	manual: boolean;
}

export interface CouponWeightRecordResult {
	id: string;
	productName: string | null;
	unit: string | null;
	pricePerProduct: number | null;
	quantityPerProduct: number | null;
	quantity: number | null;
	weight: number | null;
	amount?: number | null;
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
	invoiceRefNo?: string | null;
}

export interface CreateCouponRequest {
	date?: string;
	vehicleId: string;
	driverName?: string;
	employeeId: string;
	remark?: string;
	weightRecords: CreateWeightRecordRequest[];
	couponNo?: number;
	couponId?: number;
	accNo?: string;
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

export interface UpdateCouponRequest {
	date?: string;
	driverName?: string;
	employeeId?: string;
	remark?: string;
	weightRecords: CreateWeightRecordRequest[];
	couponId?: number;
	accNo?: string;
}

export interface DeleteCouponRequest {
	delAccNo?: string;
	delDate?: string;
}
