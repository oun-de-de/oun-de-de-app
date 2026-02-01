export type VehicleType = "truck" | "tuk_tuk" | "others";

export interface CreateVehicle {
	vehicleType: VehicleType | string;
	licensePlate: string;
}

export interface Vehicle extends CreateVehicle {
	id: string;
}
