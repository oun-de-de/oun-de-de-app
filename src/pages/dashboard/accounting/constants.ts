export const ACCOUNTING_REFERENCE_PAGE_SIZE = 1000;

export const ACCOUNTING_QUERY_KEYS = {
	accountTypes: ["accounting-account-types"] as const,
	chartAccounts: ["accounting-chart-accounts", ACCOUNTING_REFERENCE_PAGE_SIZE] as const,
	referenceAccountTypes: ["accounting-reference-account-types"] as const,
	referenceChartAccounts: ["accounting-reference-chart-accounts", ACCOUNTING_REFERENCE_PAGE_SIZE] as const,
	referenceJournalTypes: ["accounting-reference-journal-types"] as const,
	referenceJournalClasses: ["accounting-reference-journal-classes"] as const,
	referenceEmployees: ["accounting-reference-employees"] as const,
};

export const ACCOUNTING_ALL_TYPES_FILTER = "all";

export const ACCOUNTING_SIDEBAR_TYPE_OPTIONS = [
	{ value: ACCOUNTING_ALL_TYPES_FILTER, label: "Account type" },
	{ value: "asset", label: "Asset" },
	{ value: "liability", label: "Liability" },
	{ value: "equity", label: "Equity" },
	{ value: "revenue", label: "Revenue" },
	{ value: "expense", label: "Expense" },
];

export const ACCOUNTING_TABLE_TYPE_OPTIONS = [
	{ value: "journal", label: "Journal Type" },
	{ value: "cash-sale", label: "Cash Sale" },
	{ value: "revenue", label: "Revenue" },
	{ value: "receipt", label: "Receipt" },
	{ value: "expense", label: "Expense" },
	{ value: "invoice", label: "Invoice" },
];

export const ACCOUNTING_TABLE_FIELD_OPTIONS = [
	{ value: "all", label: "Field name" },
	{ value: "ref-no", label: "Ref No" },
	{ value: "memo", label: "Memo" },
];

export const ACCOUNTING_CREATE_OPTION_TARGETS = [
	{ label: "Create Journal", path: "/dashboard/accounting/create-journal", isDraftOnly: true },
	{ label: "Create Expense", path: "/dashboard/accounting/create-expense", isDraftOnly: true },
	{ label: "Create Cash Transaction", path: "/dashboard/accounting-center/create", isDraftOnly: true },
	{ label: "Create Revenue", path: "/dashboard/accounting/create-revenue", isDraftOnly: true },
	{ label: "Create Chart Account", path: "/dashboard/accounting/create-chart-account", isDraftOnly: false },
] as const;

export const ACCOUNTING_CURRENCY_OPTIONS = [
	{ value: "KHR", label: "KHR" },
	{ value: "USD", label: "USD" },
] as const;

export const ACCOUNTING_JOURNAL_NAME_OPTIONS = [
	{ value: "atlas", label: "Atlas Supplies" },
	{ value: "tony", label: "Tony Trading" },
	{ value: "walk-in", label: "Walk-in" },
] as const;

export const ACCOUNTING_REVENUE_NAME_OPTIONS = [
	{ value: "tony", label: "Tony Trading" },
	{ value: "walk-in", label: "Walk-in" },
	{ value: "retail", label: "Retail Customer" },
] as const;

export const ACCOUNTING_TRANSACTION_PAY_METHOD_OPTIONS = [
	{ value: "cash", label: "Cash" },
	{ value: "bank", label: "Bank" },
	{ value: "transfer", label: "Transfer" },
] as const;

export const ACCOUNTING_TRANSACTION_NAME_OPTIONS = [
	{ value: "supplier-a", label: "Atlas Supplies" },
	{ value: "customer-a", label: "Tony Trading" },
	{ value: "walk-in", label: "Walk-in" },
] as const;

export const ACCOUNTING_EXPENSE_NAME_OPTIONS = [
	{ value: "customer-001", label: "កាណា", type: "Customer" },
	{ value: "customer-002", label: "គុណ (2ភ្នូតង)", type: "Customer" },
	{ value: "customer-003", label: "សុភ័ក្រ្ត (តាំងជាប់ផ្សារតាខ្មៅ)", type: "Customer" },
	{ value: "customer-004", label: "ព្រីង", type: "Customer" },
	{ value: "customer-005", label: "មុនា", type: "Customer" },
	{ value: "customer-006", label: "មី (2ខ65511)", type: "Customer" },
	{ value: "customer-007", label: "រ៉ា (ឆី2AA-9221)", type: "Customer" },
	{ value: "customer-008", label: "ចេង (2AM-0507)", type: "Customer" },
] as const;

export const ACCOUNTING_UI_TEXT = {
	headerLabel: "Chart of Accounts",
	selectedAccountLabel: "Selected account",
	noAccountSelected: "No account selected",
	viewSelectedAccountTitle: "View selected account",
	inactivateSelectedAccountTitle: "Mark selected account as inactive",
	createChartAccount: "Create Chart Account",
	createChartAccountPrimary: "Create Chart Account",
	draftOptionSuffix: "Draft",
	inactiveConfirmTitle: "Confirm",
	inactiveConfirmAction: "OK",
	inactiveConfirmCancel: "Cancel",
	tableTypePlaceholder: "Journal Type",
	tableFieldPlaceholder: "Field name",
	tableSearchPlaceholder: "Search...",
	createPageTitle: "Create Chart Account",
	viewPageTitle: "View Chart Account",
	cardTitle: "Chart of account",
	viewOnlyNotice:
		"Editing chart accounts is not available yet because the current API only supports listing and creating chart accounts.",
	formIncomplete: "Please complete the required fields",
	createSuccess: "Chart account created",
	createError: "Failed to create chart account",
	close: "Close",
	cancel: "Cancel",
	saveAndClose: "Save & Close",
	saveAndNew: "Save & New",
} as const;

export const ACCOUNTING_DRAFT_FORM_TEXT = {
	journal: {
		pageTitle: "Create Journal",
		cardTitle: "Journal",
		notice:
			"This form is currently draft-only. The backend does not expose a journal create endpoint yet, so Save only stores a local draft.",
		saveAndClose: "Save Draft & Close",
		saveAndNew: "Save Draft & New",
		successMessage: "Journal draft saved",
	},
	expense: {
		pageTitle: "Create Cash Expense",
		cardTitle: "Create Cash Expense",
		notice:
			"This form is currently draft-only. The backend does not expose a cash expense create endpoint yet, so Save only stores a local draft.",
		saveAndClose: "Save Draft & Close",
		saveAndNew: "Save Draft & New",
		successMessage: "Create expense draft saved",
	},
	revenue: {
		pageTitle: "Create Cash Revenue",
		cardTitle: "Create Cash Revenue",
		notice:
			"This form is currently draft-only. The backend does not expose a cash revenue create endpoint yet, so Save only stores a local draft.",
		saveAndClose: "Save Draft & Close",
		successMessage: "Revenue draft saved",
	},
	transaction: {
		pageTitle: "Create Cash Transaction",
		cardTitle: "Create Cash Transaction",
		notice:
			"This form is currently draft-only. The backend does not expose a cash transaction create endpoint yet, so Save only stores a local draft.",
		saveAndClose: "Save Draft & Close",
		saveAndNew: "Save Draft & New",
		successMessage: "Create cash transaction draft saved",
	},
} as const;
