export const VEHICLE_QUERY_KEYS = {
	all: ["vehicles"] as const,
	list: () => [...VEHICLE_QUERY_KEYS.all, "list"] as const,
};
