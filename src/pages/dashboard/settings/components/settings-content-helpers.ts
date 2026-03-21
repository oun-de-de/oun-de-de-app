import { settingsRows } from "@/_mock/data/dashboard";
import type { FormFieldConfig } from "@/core/components/common";
import type {
	AccountTypeNature,
	AccountTypeResult,
	ChartOfAccountResult,
	JournalClassResult,
	JournalTypeResult,
} from "@/core/types/accounting";
import type { SettingsRow } from "@/core/types/common";
import type { Currency, Unit, Warehouse } from "@/core/types/setting";
import { getChartAccountAccountTypeId } from "@/pages/dashboard/accounting/utils/map-chart-account-result";
import { ACCOUNTING_SETTINGS_PLACEHOLDER_ITEMS, ACCOUNTING_SETTINGS_SUPPORTED_ITEMS } from "../constants";
import { getSettingsItemConfig } from "../settings-module-config";

export const ACCOUNT_TYPE_NATURE_OPTIONS: { label: string; value: AccountTypeNature }[] = [
	{ label: "Asset", value: "ASSET" },
	{ label: "Liability", value: "LIABILITY" },
	{ label: "Equity", value: "EQUITY" },
	{ label: "Revenue", value: "REVENUE" },
	{ label: "Expense", value: "EXPENSE" },
];

export function isAccountingSettingsItem(activeItem: string) {
	return getSettingsItemConfig(activeItem)?.isAccounting ?? ACCOUNTING_SETTINGS_SUPPORTED_ITEMS.has(activeItem);
}

export function isAccountingPlaceholderItem(activeItem: string) {
	return getSettingsItemConfig(activeItem)?.isPlaceholder ?? ACCOUNTING_SETTINGS_PLACEHOLDER_ITEMS.has(activeItem);
}

export function getAccountingFormFields(
	activeItem: string,
	accountTypeOptions: { label: string; value: string }[],
): FormFieldConfig[] {
	if (activeItem === "Chart of Accounts") {
		return [
			{ name: "code", label: "Code", type: "text", placeholder: "Enter account code…", required: true },
			{ name: "name", label: "Name", type: "text", placeholder: "Enter account name…", required: true },
			{
				name: "accountTypeId",
				label: "Account Type",
				type: "select",
				options: accountTypeOptions,
				required: true,
			},
			{
				name: "descr",
				label: "Description",
				type: "textarea",
				placeholder: "Enter description…",
				className: "md:col-span-2",
				rows: 5,
			},
		];
	}

	if (activeItem === "Account Type") {
		return [
			{ name: "code", label: "Code", type: "text", placeholder: "Enter account type code…", required: true },
			{ name: "name", label: "Name", type: "text", placeholder: "Enter account type name…", required: true },
			{
				name: "nature",
				label: "Nature",
				type: "select",
				options: ACCOUNT_TYPE_NATURE_OPTIONS,
				required: true,
			},
			{
				name: "descr",
				label: "Description",
				type: "textarea",
				placeholder: "Enter description…",
				className: "md:col-span-2",
				rows: 5,
			},
		];
	}

	return [
		{
			name: "name",
			label: "Name",
			type: "text",
			placeholder: `Enter ${activeItem.toLowerCase()} name…`,
			required: true,
		},
		{
			name: "descr",
			label: "Description",
			type: "textarea",
			placeholder: "Enter description…",
			className: "md:col-span-2",
			rows: 5,
		},
	];
}

type SettingsContentDataParams = {
	activeItem: string;
	warehouses?: Warehouse[];
	units?: Unit[];
	currencies?: Currency[];
	accountTypes: AccountTypeResult[];
	chartAccounts: ChartOfAccountResult[];
	journalClasses: JournalClassResult[];
	journalTypes: JournalTypeResult[];
};

export function getSettingsContentData({
	activeItem,
	warehouses,
	units,
	currencies,
	accountTypes,
	chartAccounts,
	journalClasses,
	journalTypes,
}: SettingsContentDataParams): SettingsRow[] {
	if (activeItem === "Warehouse") {
		return (warehouses || []).map((item) => ({ ...item, type: "Warehouse" }));
	}

	if (activeItem === "Unit") {
		return units || [];
	}

	if (activeItem === "Currency") {
		return (currencies || []).map((item) => ({
			id: item.id,
			name: item.name,
			descr: item.descr ?? "",
			type: "Currency",
		}));
	}

	if (activeItem === "Chart of Accounts") {
		return chartAccounts.map((item) => ({
			id: item.id,
			code: item.code,
			name: item.name,
			descr: item.descr ?? "",
			type:
				item.accountType?.name ??
				accountTypes.find((accountType) => accountType.id === getChartAccountAccountTypeId(item))?.name ??
				"Unknown",
		}));
	}

	if (activeItem === "Account Type") {
		return accountTypes.map((item) => ({
			id: item.id,
			code: item.code,
			name: item.name,
			descr: item.descr ?? "",
			type: item.nature,
		}));
	}

	if (activeItem === "Journal Type") {
		return journalTypes.map((item) => ({
			id: item.id,
			name: item.name,
			descr: item.descr ?? "",
			type: "Journal Type",
		}));
	}

	if (activeItem === "Journal Class") {
		return journalClasses.map((item) => ({
			id: item.id,
			name: item.name,
			descr: item.descr ?? "",
			type: "Journal Class",
		}));
	}

	if (isAccountingPlaceholderItem(activeItem)) {
		return [];
	}

	return settingsRows;
}

export function filterSettingsRows(data: SettingsRow[], search: string) {
	const normalizedSearch = search.toLowerCase();
	return data.filter((row) => {
		return (
			row.name.toLowerCase().includes(normalizedSearch) ||
			row.code?.toLowerCase().includes(normalizedSearch) ||
			row.descr?.toLowerCase().includes(normalizedSearch)
		);
	});
}
