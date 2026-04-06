export const SETTINGS_TOP_TABS = [
	"Items",
	// "Vendors",
	//  "Customers",
	"Accounting",
	// "Template",
	"Company",
] as const;

export const SETTINGS_MENU_BY_TAB: Record<(typeof SETTINGS_TOP_TABS)[number], string[]> = {
	Items: ["Unit", "Warehouse", "Supplier"],
	// Vendors: [],
	// Customers: [],
	Accounting: ["Chart of Accounts", "Journal Class", "Journal Type", "Account Type"],
	// Template: [],
	Company: ["Currency"],
};

export const ACCOUNTING_SETTINGS_SUPPORTED_ITEMS = new Set([
	"Chart of Accounts",
	"Journal Class",
	"Journal Type",
	"Account Type",
]);

export const ACCOUNTING_SETTINGS_PLACEHOLDER_ITEMS = new Set([
	"Payment Method",
	"Advance",
	"Invoice Template",
	"Import Data",
]);
