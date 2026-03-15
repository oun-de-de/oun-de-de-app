export type VehicleType = "truck" | "tuk_tuk" | "others";
export type VehicleApiType = "TRUCK" | "TUK_TUK" | "OTHERS";

export const VEHICLE_TYPE_OPTIONS = [
	{ value: "truck", label: "Truck" },
	{ value: "tuk_tuk", label: "Tuk Tuk" },
	{ value: "others", label: "Others" },
] as const;

const VEHICLE_TYPE_LABELS: Record<VehicleType | VehicleApiType, string> = {
	truck: "Truck",
	tuk_tuk: "Tuk Tuk",
	others: "Others",
	TRUCK: "Truck",
	TUK_TUK: "Tuk Tuk",
	OTHERS: "Others",
};

export function normalizeVehicleType(value?: string | null): VehicleType | "" {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "truck" || normalized === "tuk_tuk" || normalized === "others") return normalized;
	return "";
}

export function getVehicleTypeLabel(value?: string | null): string {
	if (!value) return "-";
	return VEHICLE_TYPE_LABELS[value as keyof typeof VEHICLE_TYPE_LABELS] ?? value;
}

export interface CreateVehicle {
	vehicleType: VehicleType | string;
	licensePlate: string;
}

export interface Vehicle extends CreateVehicle {
	id: string;
	vehicleType: VehicleApiType | VehicleType | string;
}
