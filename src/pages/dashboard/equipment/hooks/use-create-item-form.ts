import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SELECT_NONE_VALUE } from "@/core/constants/form";
import type { CreateInventoryItem, CreateInventoryItemType } from "@/core/types/inventory";

function generateInitialStockRefCode() {
	const now = new Date();
	const timestamp = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, "0"),
		String(now.getDate()).padStart(2, "0"),
	].join("");
	const time = [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join("");

	return `INI-${timestamp}-${time}`;
}

const createItemSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	type: z.enum(["consumable", "equipment"]),
	unitId: z.string().optional(),
	supplierId: z.string().optional(),
	unitPrice: z.coerce.number().min(0, "Unit price must be 0 or greater"),
	alertThreshold: z.number().min(0).optional(),
	refCodeMode: z.enum(["auto", "manual"]),
	refCode: z.string(),
	quantityOnHand: z.coerce.number().min(0),
}).superRefine((values, ctx) => {
	if (values.quantityOnHand > 0 && !values.refCode.trim()) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["refCode"],
			message: "Ref code is required when initial quantity is greater than 0",
		});
	}
});

export type CreateItemFormValues = z.infer<typeof createItemSchema>;

type UseCreateItemFormOptions = {
	onSubmit: (data: CreateInventoryItem) => Promise<unknown>;
};

function normalizeOptionalId(value?: string) {
	return value && value !== SELECT_NONE_VALUE ? value : undefined;
}

function mapCreateItemFormValuesToPayload(values: CreateItemFormValues): CreateInventoryItem {
	const normalizedRefCode = values.refCode?.trim();
	const shouldIncludeInitStock = Boolean(normalizedRefCode) && values.quantityOnHand > 0;

	return {
		name: values.name.trim(),
		type: values.type as CreateInventoryItemType,
		unitPrice: values.unitPrice,
		...(normalizeOptionalId(values.unitId) ? { unitId: values.unitId } : {}),
		...(normalizeOptionalId(values.supplierId) ? { supplierId: values.supplierId } : {}),
		...(shouldIncludeInitStock
			? {
					initStock: {
						refCode: normalizedRefCode!,
						quantityOnHand: values.quantityOnHand,
					},
				}
			: {}),
		alertThreshold: values.alertThreshold ?? 1,
	};
}

export function useCreateItemForm({ onSubmit }: UseCreateItemFormOptions) {
	const form = useForm<CreateItemFormValues>({
		resolver: zodResolver(createItemSchema),
		defaultValues: {
			name: "",
			type: "consumable",
			unitId: "",
			supplierId: "",
			unitPrice: 0,
			alertThreshold: undefined,
			refCodeMode: "auto",
			refCode: "",
			quantityOnHand: 0,
		},
	});

	const { watch, setValue, getValues, reset } = form;

	const refCodeMode = watch("refCodeMode");
	const refCode = watch("refCode", "");
	const quantityOnHand = watch("quantityOnHand");

	useEffect(() => {
		if (quantityOnHand > 0 && refCodeMode === "auto" && !refCode.trim()) {
			setValue("refCode", generateInitialStockRefCode(), { shouldDirty: true, shouldValidate: true });
		}
	}, [setValue, quantityOnHand, refCode, refCodeMode]);

	useEffect(() => {
		if (quantityOnHand <= 0 && refCode) {
			setValue("refCode", "", { shouldDirty: true, shouldValidate: true });
		}
	}, [setValue, quantityOnHand, refCode]);

	const submit = async (values: CreateItemFormValues) => {
		await onSubmit(mapCreateItemFormValuesToPayload(values));
	};

	return {
		form,
		submit,
		regenerateRefCode: () => {
			if (getValues("quantityOnHand") <= 0) return;
			setValue("refCode", generateInitialStockRefCode(), { shouldDirty: true, shouldValidate: true });
		},
		reset: () =>
			reset({
				name: "",
				type: "consumable",
				unitId: "",
				supplierId: "",
				unitPrice: 0,
				alertThreshold: undefined,
				refCodeMode: "auto",
				refCode: "",
				quantityOnHand: 0,
			}),
	};
}
