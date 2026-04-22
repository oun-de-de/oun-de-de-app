import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import type { InventoryItem, InventoryTransactionReasonInput } from "@/core/types/inventory";
import { useUpdateStock } from "../../hooks/use-inventory-mutations";

const REASON_PREFIX_MAP: Record<string, string> = {
	purchase: "PUR",
	consume: "CON",
	return: "RET",
	borrow: "BOR",
	sold: "SLD",
};
const STOCK_UPDATE_REASONS = Object.keys(REASON_PREFIX_MAP) as [
	InventoryTransactionReasonInput,
	...InventoryTransactionReasonInput[],
];

function generateRefCode(reason: string): string {
	const prefix = REASON_PREFIX_MAP[reason.toLowerCase()] ?? reason.slice(0, 3).toUpperCase();
	const now = new Date();
	const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
	const timePart = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
	return `${prefix}-${datePart}-${timePart}`;
}

function getQuantityDelta(reason: string, quantity: number) {
	switch (reason.toLowerCase()) {
		case "purchase":
		case "return":
			return quantity;
		case "consume":
		case "borrow":
		case "sold":
			return -quantity;
		default:
			return 0;
	}
}

const updateStockSchema = z.object({
	quantity: z
		.string()
		.min(1, "Quantity is required")
		.refine((val) => Number(val) > 0, "Quantity must be greater than 0"),
	reason: z.enum(STOCK_UPDATE_REASONS),
	memo: z.string(),
	expense: z.string().optional(),
	refCode: z.string().trim().min(1, "Reference code is required"),
	refCodeMode: z.enum(["auto", "manual"]),
});

export type UpdateStockFormValues = z.infer<typeof updateStockSchema>;

export function useEquipmentStockForm(item: InventoryItem | null) {
	const updateStockMutation = useUpdateStock(item?.id);

	const form = useForm<UpdateStockFormValues>({
		resolver: zodResolver(updateStockSchema),
		defaultValues: {
			quantity: "1",
			reason: "purchase",
			memo: "",
			expense: "",
			refCode: "",
			refCodeMode: "auto",
		},
	});

	const { watch, getValues, setValue, reset } = form;
	const reason = watch("reason");
	const refCode = watch("refCode", "");
	const refCodeMode = watch("refCodeMode");

	const regenerateRefCode = useCallback(
		(customReason?: string) => {
			const targetReason = customReason ?? reason;
			const code = generateRefCode(targetReason);
			setValue("refCode", code, { shouldValidate: true });
		},
		[reason, setValue],
	);

	// Sync auto ref code when reason changes OR if empty (after reset)
	useEffect(() => {
		if (refCodeMode === "auto") {
			// If empty (e.g. after reset) or if reason changed (we want a new prefix)
			// We check against the current refCode to avoid redundant generation
			// and potential loops, though generateRefCode uses Date.now() so it's usually fresh.
			if (!refCode || !refCode.startsWith(REASON_PREFIX_MAP[reason.toLowerCase()] ?? "REF")) {
				regenerateRefCode();
			}
		}
	}, [reason, refCodeMode, refCode, regenerateRefCode]);

	useEffect(() => {
		if (reason === "consume" && getValues("expense")) {
			setValue("expense", "", { shouldDirty: true, shouldValidate: true });
		}
	}, [reason, getValues, setValue]);

	const handleSubmit = async (values: UpdateStockFormValues) => {
		if (!item) return;

		const parsedQty = Number(values.quantity);
		const parsedExpense = values.reason === "consume" ? undefined : values.expense ? Number(values.expense) : undefined;
		try {
			await updateStockMutation.mutateAsync({
				refCode: values.refCode.trim(),
				quantity: parsedQty,
				reason: values.reason,
				memo: values.memo,
				...(parsedExpense && parsedExpense > 0 ? { expense: parsedExpense } : {}),
			});

			// Stock threshold warning
			if (Number.isFinite(parsedQty)) {
				const updatedQty = item.quantityOnHand + getQuantityDelta(values.reason, parsedQty);
				if (updatedQty < item.alertThreshold) {
					toast.warning(`Stock is below threshold (${updatedQty} < ${item.alertThreshold}) for ${item.name}.`);
				}
			}

			reset();
		} catch (e) {
			if (import.meta.env.DEV) {
				console.error("Stock update failed:", e);
			}
			throw e;
		}
	};

	return {
		form,
		isPending: updateStockMutation.isPending,
		regenerateRefCode,
		submit: handleSubmit,
	};
}
