import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateBorrowing } from "../../hooks/use-inventory-mutations";

const createBorrowingSchema = z.object({
	customerId: z.string().min(1, "Please select customer"),
	quantity: z
		.string()
		.min(1, "Quantity is required")
		.refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Quantity must be greater than 0"),
	expectedReturnDate: z
		.string()
		.min(1, "Expected return date is required")
		.refine((value) => !!toIsoDateValue(value), "Expected return date is invalid"),
	memo: z.string(),
});

export type CreateBorrowingFormValues = z.infer<typeof createBorrowingSchema>;

function toLocalMidnightDateTime(dateValue: string): string {
	return `${dateValue}T00:00:00`;
}

export function formatIsoDateForDisplay(value: string): string {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
	const [year, month, day] = value.split("-");
	return `${day}/${month}/${year}`;
}

export function toIsoDateValue(displayValue: string): string {
	const normalized = displayValue.trim();
	const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (!match) return "";

	const [, dayText, monthText, yearText] = match;
	const day = Number(dayText);
	const month = Number(monthText);
	const year = Number(yearText);
	const parsed = new Date(year, month - 1, day);

	if (
		Number.isNaN(parsed.getTime()) ||
		parsed.getFullYear() !== year ||
		parsed.getMonth() !== month - 1 ||
		parsed.getDate() !== day
	) {
		return "";
	}

	return `${yearText}-${monthText}-${dayText}`;
}

export function useEquipmentBorrowingForm(itemId: string) {
	const createBorrowing = useCreateBorrowing(itemId);
	const form = useForm<CreateBorrowingFormValues>({
		resolver: zodResolver(createBorrowingSchema),
		defaultValues: {
			customerId: "",
			quantity: "1",
			expectedReturnDate: "",
			memo: "",
		},
	});

	const submit = async (values: CreateBorrowingFormValues) => {
		const expectedReturnDateIso = toIsoDateValue(values.expectedReturnDate);
		await createBorrowing.mutateAsync({
			customerId: values.customerId,
			quantity: Number(values.quantity),
			expectedReturnDate: toLocalMidnightDateTime(expectedReturnDateIso),
			memo: values.memo,
		});
	};

	return {
		form,
		submit,
		reset: () => form.reset(),
		isPending: createBorrowing.isPending,
	};
}
