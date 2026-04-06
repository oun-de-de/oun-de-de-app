export type SettingsQueryResource =
	| "warehouses"
	| "units"
	| "suppliers"
	| "currencies"
	| "accountTypes"
	| "chartAccounts"
	| "journalTypes"
	| "journalClasses";

export type SettingsItemConfig = {
	queries: SettingsQueryResource[];
	formQueries?: SettingsQueryResource[];
	isAccounting?: boolean;
	isPlaceholder?: boolean;
	formKind?: "accounting" | "default";
	supportsCreate?: boolean;
	supportsEdit?: boolean;
};

export const SETTINGS_ITEM_CONFIG: Record<string, SettingsItemConfig> = {
	Warehouse: {
		queries: ["warehouses"],
		formKind: "default",
		supportsCreate: true,
		supportsEdit: true,
	},
	Unit: {
		queries: ["units"],
		formKind: "default",
		supportsCreate: true,
		supportsEdit: true,
	},
	Supplier: {
		queries: ["suppliers"],
		formKind: "default",
		supportsCreate: true,
		supportsEdit: true,
	},
	Currency: {
		queries: ["currencies"],
		formKind: "default",
		supportsCreate: true,
		supportsEdit: false,
	},
	"Chart of Accounts": {
		queries: ["chartAccounts"],
		formQueries: ["accountTypes"],
		isAccounting: true,
		formKind: "accounting",
		supportsCreate: true,
		supportsEdit: false,
	},
	"Account Type": {
		queries: ["accountTypes"],
		isAccounting: true,
		formKind: "accounting",
		supportsCreate: true,
		supportsEdit: false,
	},
	"Journal Type": {
		queries: ["journalTypes"],
		isAccounting: true,
		formKind: "accounting",
		supportsCreate: true,
		supportsEdit: false,
	},
	"Journal Class": {
		queries: ["journalClasses"],
		isAccounting: true,
		formKind: "accounting",
		supportsCreate: true,
		supportsEdit: false,
	},
};

export function getSettingsItemConfig(activeItem: string): SettingsItemConfig | undefined {
	return SETTINGS_ITEM_CONFIG[activeItem];
}

export function hasSettingsQueryRequirement(activeItem: string, resource: SettingsQueryResource) {
	return !!SETTINGS_ITEM_CONFIG[activeItem]?.queries.includes(resource);
}
