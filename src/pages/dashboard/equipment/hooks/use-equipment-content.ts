import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useInventoryItems } from "./use-inventory-items";
import { useCreateItem } from "./use-inventory-mutations";
import { useEquipmentTable } from "./use-equipment-table";
import type { CreateInventoryItem } from "@/core/types/inventory";

const EQUIPMENT_TYPE_OPTIONS = [
	{ value: "all", label: "All Type" },
	{ value: "consumable", label: "Consumable" },
	{ value: "equipment", label: "Equipment" },
];

const EQUIPMENT_FIELD_OPTIONS = [
	{ value: "name", label: "Name" },
	{ value: "code", label: "Code" },
	{ value: "supplier", label: "Supplier" },
];

const SEARCH_PLACEHOLDER = "Search items";

function buildSummaryCards(items: Array<{ quantityOnHand: number; alertThreshold: number }>) {
	const totalOnHand = items.reduce((sum, item) => sum + item.quantityOnHand, 0);
	const lowStockCount = items.filter((item) => item.quantityOnHand <= item.alertThreshold).length;

	return [
		{ label: "Items", value: items.length, color: "bg-blue-500", icon: "mdi:package-variant" },
		{ label: "Total On Hand", value: totalOnHand, color: "bg-green-500", icon: "mdi:counter" },
		{ label: "Low Stock", value: lowStockCount, color: "bg-orange-500", icon: "mdi:alert-circle-outline" },
	];
}

export function useEquipmentContent(activeItemId: string | null) {
	const navigate = useNavigate();

	const { data: items = [] } = useInventoryItems();
	const createItemMutation = useCreateItem();
	const activeItem = useMemo(
		() => (activeItemId ? (items.find((item) => item.id === activeItemId) ?? null) : null),
		[activeItemId, items],
	);
	const displayItems = useMemo(() => (activeItem ? [activeItem] : items), [activeItem, items]);
	const table = useEquipmentTable(displayItems, navigate);
	const summaryCards = useMemo(() => buildSummaryCards(displayItems), [displayItems]);
	const handleCreateItem = useCallback(
		(data: CreateInventoryItem) => createItemMutation.mutateAsync(data),
		[createItemMutation],
	);
	const handleRowClick = useCallback(
		(row: (typeof table.pagedRows)[number]) => {
			const link = table.getRowLink(row);
			if (link) navigate(link);
		},
		[navigate, table],
	);
	const filterConfig = useMemo(
		() => ({
			showTypeFilter: false,
			typeOptions: EQUIPMENT_TYPE_OPTIONS,
			fieldOptions: EQUIPMENT_FIELD_OPTIONS,
			typeValue: table.typeFilter,
			fieldValue: table.fieldFilter,
			searchValue: table.searchValue,
			onTypeChange: table.setTypeFilter,
			onFieldChange: table.setFieldFilter,
			onSearchChange: table.setSearchValue,
			searchPlaceholder: SEARCH_PLACEHOLDER,
		}),
		[
			table.fieldFilter,
			table.searchValue,
			table.setFieldFilter,
			table.setSearchValue,
			table.setTypeFilter,
			table.typeFilter,
		],
	);

	return {
		items,
		activeItem,
		summaryCards,
		createItem: {
			submit: handleCreateItem,
			isPending: createItemMutation.isPending,
		},
		table,
		filterConfig,
		handleRowClick,
	};
}
