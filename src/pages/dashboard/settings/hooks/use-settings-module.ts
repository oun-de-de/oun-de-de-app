import { useEffect, useMemo } from "react";
import { useAccountingReferenceData } from "@/pages/dashboard/accounting/hooks/use-accounting-reference-data";
import { useGetCurrencyList, useGetUnitList, useGetWarehouseList } from "./use-settings";
import { getColumnsForItem } from "../components/settings-columns";
import {
	filterSettingsRows,
	getAccountingFormFields,
	getSettingsContentData,
	isAccountingPlaceholderItem,
	isAccountingSettingsItem,
} from "../components/settings-content-helpers";
import { getSettingsItemConfig, hasSettingsQueryRequirement } from "../settings-module-config";
import { useSettingsListState, useSettingsUiActions } from "../stores";

type UseSettingsModuleParams = {
	activeItem: string;
	showForm: boolean;
};

export function useSettingsModule({ activeItem, showForm }: UseSettingsModuleParams) {
	const { page, pageSize, search } = useSettingsListState();
	const { setPage, setPageSize, setSearch } = useSettingsUiActions();
	const itemConfig = getSettingsItemConfig(activeItem);
	const accountingItem = isAccountingSettingsItem(activeItem);
	const accountingPlaceholderItem = isAccountingPlaceholderItem(activeItem);
	const formKind = itemConfig?.formKind ?? "default";
	const canCreate = itemConfig?.supportsCreate ?? activeItem !== "";
	const canEdit = itemConfig?.supportsEdit ?? true;
	const needsWarehouses = hasSettingsQueryRequirement(activeItem, "warehouses");
	const needsUnits = hasSettingsQueryRequirement(activeItem, "units");
	const needsCurrencies = hasSettingsQueryRequirement(activeItem, "currencies");
	const needsChartAccounts = hasSettingsQueryRequirement(activeItem, "chartAccounts");
	const needsJournalTypes = hasSettingsQueryRequirement(activeItem, "journalTypes");
	const needsJournalClasses = hasSettingsQueryRequirement(activeItem, "journalClasses");
	const needsAccountTypes =
		hasSettingsQueryRequirement(activeItem, "accountTypes") ||
		(showForm && Boolean(itemConfig?.formQueries?.includes("accountTypes")));
	const { data: warehouses } = useGetWarehouseList({ enabled: needsWarehouses });
	const { data: units } = useGetUnitList({ enabled: needsUnits });
	const { data: currencies } = useGetCurrencyList({ enabled: needsCurrencies });
	const { accountTypes, chartAccounts, journalClasses, journalTypes, accountTypeOptions } = useAccountingReferenceData({
		accountTypesEnabled: needsAccountTypes,
		chartAccountsEnabled: needsChartAccounts,
		journalClassesEnabled: needsJournalClasses,
		journalTypesEnabled: needsJournalTypes,
		employeesEnabled: false,
		customersEnabled: false,
		loadChartAccountType: needsChartAccounts,
	});

	useEffect(() => {
		setPage(1);
		setSearch("");
	}, [activeItem, setPage, setSearch]);

	const data = useMemo(
		() =>
			getSettingsContentData({
				activeItem,
				warehouses,
				units,
				currencies,
				accountTypes,
				chartAccounts,
				journalClasses,
				journalTypes,
			}),
		[activeItem, warehouses, units, currencies, accountTypes, chartAccounts, journalClasses, journalTypes],
	);
	const filteredRows = useMemo(() => filterSettingsRows(data, search), [data, search]);
	const columns = useMemo(() => getColumnsForItem(activeItem, canEdit), [activeItem, canEdit]);
	const accountingFormFields = useMemo(
		() => getAccountingFormFields(activeItem, accountTypeOptions),
		[activeItem, accountTypeOptions],
	);
	const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, totalPages]);

	return {
		page,
		pageSize,
		search,
		setPage,
		setPageSize,
		setSearch,
		accountingItem,
		accountingPlaceholderItem,
		canCreate,
		canEdit,
		filteredRows,
		columns,
		accountingFormFields,
		formKind,
		totalPages,
		itemConfig,
	};
}
