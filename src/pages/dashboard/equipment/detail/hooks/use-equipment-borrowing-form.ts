import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateBorrowing } from "../../hooks/use-inventory-mutations";

const createBorrowingSchema = z.object({
	customerId: z.string().min(1, "Please select customer"),
	quantity: z
		.string()
		.min(1, "Quantity is required")
		.refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, "Quantity must be greater than 0"),
	expectedReturnDate: z.string().min(1, "Expected return date is required"),
	memo: z.string(),
});

export type CreateBorrowingFormValues = z.infer<typeof createBorrowingSchema>;

function toLocalMidnightDateTime(dateValue: string): string {
	return `${dateValue}T00:00:00`;
}

function parseLocalDate(value: string): Date | undefined {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
	const [year, month, day] = value.split("-").map(Number);
	return new Date(year, month - 1, day);
}

export function formatDateForValue(date: Date): string {
	return format(date, "yyyy-MM-dd");
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

	const expectedReturnDate = form.watch("expectedReturnDate");
	const selectedExpectedReturnDate = useMemo(() => parseLocalDate(expectedReturnDate), [expectedReturnDate]);

	const submit = async (values: CreateBorrowingFormValues) => {
		await createBorrowing.mutateAsync({
			customerId: values.customerId,
			quantity: Number(values.quantity),
			expectedReturnDate: toLocalMidnightDateTime(values.expectedReturnDate),
			memo: values.memo,
		});
	};

	return {
		form,
		selectedExpectedReturnDate,
		submit,
		reset: () => form.reset(),
		isPending: createBorrowing.isPending,
	};
}
