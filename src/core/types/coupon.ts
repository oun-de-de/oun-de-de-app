export interface WeightRecord {
	id?: string;
	price: number;
	weight: number;
	outTime: string;
	manual: boolean;
}

export type VehicleType = "TRUCK" | "CAR" | "MOTORCYCLE";

export interface Vehicle {
	id: string;
	vehicleType: VehicleType;
	licensePlate: string;
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
}

export interface CreateCouponRequest {
	date: string;
	vehicleId: string;
	driverName: string;
	employeeId: string;
	remark: string;
	weightRecords: WeightRecord[];
}
