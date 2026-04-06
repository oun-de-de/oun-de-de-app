export const ACCOUNTING_REFERENCE_PAGE_SIZE = 1000;

export const ACCOUNTING_QUERY_KEYS = {
	accountTypes: ["accounting-account-types"] as const,
	chartAccounts: ["accounting-chart-accounts", ACCOUNTING_REFERENCE_PAGE_SIZE] as const,
	cashTransactions: ["accounting-cash-transactions"] as const,
	referenceAccountTypes: ["accounting-reference-account-types"] as const,
	referenceChartAccounts: ["accounting-reference-chart-accounts", ACCOUNTING_REFERENCE_PAGE_SIZE] as const,
	referenceJournalTypes: ["accounting-reference-journal-types"] as const,
	referenceJournalClasses: ["accounting-reference-journal-classes"] as const,
	referenceEmployees: ["accounting-reference-employees"] as const,
	referenceCustomers: ["accounting-reference-customers", ACCOUNTING_REFERENCE_PAGE_SIZE] as const,
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
	{ value: ACCOUNTING_ALL_TYPES_FILTER, label: "All Types" },
	{ value: "debit", label: "Debit" },
	{ value: "credit", label: "Credit" },
];

export const ACCOUNTING_TABLE_FIELD_OPTIONS = [
	{ value: "all", label: "Field name" },
	{ value: "ref-no", label: "Ref No" },
	{ value: "memo", label: "Memo" },
];

export const ACCOUNTING_FORM_TRANSACTION_TYPES = {
	expense: "CREDIT",
	revenue: "DEBIT",
} as const;

export const ACCOUNTING_TRANSACTION_TYPE_TO_API = {
	[ACCOUNTING_FORM_TRANSACTION_TYPES.expense]: "credit",
	[ACCOUNTING_FORM_TRANSACTION_TYPES.revenue]: "debit",
} as const;

export const ACCOUNTING_CREATE_OPTION_TARGETS = [
	{ label: "Create Expense", path: "/dashboard/accounting/create-expense", isDraftOnly: false },
	{ label: "Create Cash Transaction", path: "/dashboard/accounting/create-cash-transaction", isDraftOnly: false },
	{ label: "Create Revenue", path: "/dashboard/accounting/create-revenue", isDraftOnly: false },
	// { label: "Create Chart Account", path: "/dashboard/accounting/create-chart-account", isDraftOnly: false },
] as const;

export type AccountingCreateOptionLabel = (typeof ACCOUNTING_CREATE_OPTION_TARGETS)[number]["label"];

export function getAccountingCreateOptionTarget(label: AccountingCreateOptionLabel) {
	const target = ACCOUNTING_CREATE_OPTION_TARGETS.find((option) => option.label === label);
	if (!target) {
		throw new Error(`Unknown accounting create option target: ${label}`);
	}
	return target;
}

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
	selectedAccountLabel: "Selected chart account",
	noAccountSelected: "No account selected",
	viewSelectedAccountTitle: "View selected chart account",
	inactivateSelectedAccountTitle: "Mark selected chart account as inactive",
	createChartAccount: "Create Chart Account",
	createChartAccountPrimary: "Create Chart Account",
	inactiveConfirmTitle: "Confirm",
	inactiveConfirmAction: "OK",
	inactiveConfirmCancel: "Cancel",
	tableTypePlaceholder: "Transaction Type",
	tableFieldPlaceholder: "Field name",
	tableSearchPlaceholder: "Search...",
	createPageTitle: "Create Chart Account",
	viewPageTitle: "View Chart Account",
	cardTitle: "Chart of account",
	viewOnlyNotice: "Editing chart accounts is not available yet.",
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
		notice: "Complete the journal details before saving.",
		saveAndClose: "Save & Close",
		saveAndNew: "Save & New",
		successMessage: "Journal saved",
	},
	expense: {
		pageTitle: "Create Cash Expense",
		cardTitle: "Create Cash Expense",
		notice: "Complete the expense details before saving. Expense transactions use Credit.",
		saveAndClose: "Save & Close",
		saveAndNew: "Save & New",
		successMessage: "Expense saved",
	},
	revenue: {
		pageTitle: "Create Cash Revenue",
		cardTitle: "Create Cash Revenue",
		notice: "Complete the revenue details before saving. Revenue transactions use Debit.",
		saveAndClose: "Save & Close",
		successMessage: "Revenue saved",
	},
	transaction: {
		pageTitle: "Create Cash Transaction",
		cardTitle: "Create Cash Transaction",
		notice: "Each line requires an account, customer, amount, and optional class before the transaction can be saved.",
		saveAndClose: "Save & Close",
		saveAndNew: "Save & New",
		successMessage: "Cash transaction created",
	},
} as const;

export function formatAccountingCreateOptionLabel(
	target: Pick<(typeof ACCOUNTING_CREATE_OPTION_TARGETS)[number], "label" | "isDraftOnly">,
) {
	return target.label;
}

export function createAccountingCreateOption(label: AccountingCreateOptionLabel, navigate: (path: string) => void) {
	const target = getAccountingCreateOptionTarget(label);
	return {
		label: formatAccountingCreateOptionLabel(target),
		onClick: () => navigate(target.path),
	};
}

export function createAccountingCreateOptions(
	labels: readonly AccountingCreateOptionLabel[],
	navigate: (path: string) => void,
) {
	return labels.map((label) => createAccountingCreateOption(label, navigate));
}

export function createAccountingCreateMainAction(label: AccountingCreateOptionLabel, navigate: (path: string) => void) {
	const target = getAccountingCreateOptionTarget(label);
	return {
		label: formatAccountingCreateOptionLabel(target),
		onClick: () => navigate(target.path),
	};
}
