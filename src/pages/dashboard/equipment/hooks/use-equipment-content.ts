import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useInventoryItems } from "./use-inventory-items";
import { useEquipmentForms } from "./use-equipment-forms";
import { useEquipmentTable } from "./use-equipment-table";

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
	const itemId = activeItemId ?? undefined;
	const navigate = useNavigate();

	const { data: items = [] } = useInventoryItems();
	const activeItem = useMemo(
		() => (activeItemId ? (items.find((item) => item.id === activeItemId) ?? null) : null),
		[activeItemId, items],
	);
	const displayItems = useMemo(() => (activeItem ? [activeItem] : items), [activeItem, items]);
	const forms = useEquipmentForms(itemId);
	const table = useEquipmentTable(displayItems, navigate);
	const summaryCards = useMemo(() => buildSummaryCards(displayItems), [displayItems]);

	return {
		items,
		activeItem,
		summaryCards,
		...forms,
		table,
		getRowLink: table.getRowLink,
	};
}
