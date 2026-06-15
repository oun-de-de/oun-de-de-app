export const SETTINGS_QUERY_KEYS = {
	all: ["settings"] as const,
	warehouses: {
		all: () => [...SETTINGS_QUERY_KEYS.all, "warehouses"] as const,
		list: () => [...SETTINGS_QUERY_KEYS.warehouses.all(), "list"] as const,
	},
	units: {
		all: () => [...SETTINGS_QUERY_KEYS.all, "units"] as const,
		list: () => [...SETTINGS_QUERY_KEYS.units.all(), "list"] as const,
	},
	currencies: {
		all: () => [...SETTINGS_QUERY_KEYS.all, "currencies"] as const,
		list: () => [...SETTINGS_QUERY_KEYS.currencies.all(), "list"] as const,
	},
	suppliers: {
		all: () => [...SETTINGS_QUERY_KEYS.all, "suppliers"] as const,
		list: () => [...SETTINGS_QUERY_KEYS.suppliers.all(), "list"] as const,
	},
};
