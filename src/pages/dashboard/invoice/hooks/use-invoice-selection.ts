import { useCallback, useMemo, useState } from "react";
import type { Invoice } from "@/core/types/invoice";

export function useInvoiceSelection(pagedData: Invoice[]) {
	const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
	const [selectedInvoiceById, setSelectedInvoiceById] = useState<Record<string, Invoice>>({});

	const selectedIdSet = useMemo(() => new Set(selectedInvoiceIds), [selectedInvoiceIds]);
	const visibleIds = useMemo(() => pagedData.map((row) => row.id), [pagedData]);
	const rowById = useMemo(() => new Map(pagedData.map((row) => [row.id, row])), [pagedData]);

	const selectedVisibleCount = useMemo(
		() => visibleIds.filter((id) => selectedIdSet.has(id)).length,
		[visibleIds, selectedIdSet],
	);

	const allSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
	const partiallySelected = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;

	const onToggleAll = useCallback(
		(checked: boolean) => {
			setSelectedInvoiceIds((prev) => {
				const prevSet = new Set(prev);
				if (checked) {
					for (const id of visibleIds) {
						prevSet.add(id);
					}
				} else {
					for (const id of visibleIds) {
						prevSet.delete(id);
					}
				}
				return Array.from(prevSet);
			});

			if (checked) {
				setSelectedInvoiceById((prev) => {
					const next = { ...prev };
					for (const row of pagedData) {
						next[row.id] = row;
					}
					return next;
				});
				return;
			}

			setSelectedInvoiceById((prev) => {
				const next = { ...prev };
				for (const id of visibleIds) {
					delete next[id];
				}
				return next;
			});
		},
		[visibleIds, pagedData],
	);

	const onToggleOne = useCallback(
		(id: string, checked: boolean) => {
			setSelectedInvoiceIds((prev) => {
				const prevSet = new Set(prev);
				if (checked) prevSet.add(id);
				else prevSet.delete(id);
				return Array.from(prevSet);
			});

			if (checked) {
				const row = rowById.get(id);
				if (row) {
					setSelectedInvoiceById((prev) => ({ ...prev, [id]: row }));
				}
				return;
			}

			setSelectedInvoiceById((prev) => {
				const next = { ...prev };
				delete next[id];
				return next;
			});
		},
		[rowById],
	);

	return {
		selectedInvoiceIds,
		selectedInvoiceById,
		selectedIdSet,
		allSelected,
		partiallySelected,
		onToggleAll,
		onToggleOne,
		rowById,
	};
}
