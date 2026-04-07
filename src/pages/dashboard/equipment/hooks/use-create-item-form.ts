import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SELECT_NONE_VALUE } from "@/core/constants/form";
import type { CreateInventoryItem, CreateInventoryItemType } from "@/core/types/inventory";

const createItemSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	type: z.enum(["consumable", "equipment"]),
	unitId: z.string().optional(),
	supplierId: z.string().optional(),
	unitPrice: z.coerce.number().min(0, "Unit price must be 0 or greater"),
	alertThreshold: z.number().min(0).optional(),
	refCode: z.string().optional(),
	quantityOnHand: z.coerce.number().min(0),
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

	return {
		name: values.name.trim(),
		type: values.type as CreateInventoryItemType,
		unitPrice: values.unitPrice,
		...(normalizeOptionalId(values.unitId) ? { unitId: values.unitId } : {}),
		...(normalizeOptionalId(values.supplierId) ? { supplierId: values.supplierId } : {}),
		...(normalizedRefCode
			? {
					initStock: {
						refCode: normalizedRefCode,
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
			refCode: "",
			quantityOnHand: 0,
		},
	});

	const submit = async (values: CreateItemFormValues) => {
		await onSubmit(mapCreateItemFormValuesToPayload(values));
	};

	return {
		form,
		submit,
		reset: () => form.reset(),
	};
}
