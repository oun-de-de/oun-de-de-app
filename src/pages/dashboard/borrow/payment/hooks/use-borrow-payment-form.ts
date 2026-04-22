import customerService from "@/core/api/services/customer-service";
import employeeService from "@/core/api/services/employee-service";
import loanService from "@/core/api/services/loan-service";
import { formatDateStartLocalApiValue } from "@/pages/dashboard/accounting/utils/format-local-date-time";
import { useBorrowCartActions } from "@/pages/dashboard/borrow/stores/borrow-cart-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const borrowPaymentSchema = z
	.object({
		borrowerType: z.enum(["customer", "employee"]),
		borrowerId: z.string().optional(),
		employeeId: z.string().optional(),
		loanCode: z.string().trim().min(1, "Loan code is required"),
		depositAmount: z.coerce.number().min(1, "Principal amount must be greater than 0"),
		monthlyAmount: z.coerce.number().min(1, "Monthly amount must be greater than 0"),
		dueWarningDays: z.coerce.number().min(0, "Due warning days must be 0 or greater"),
		dueDate: z.date(),
		memo: z.string(),
	})
	.superRefine((data, ctx) => {
		if (data.borrowerType === "customer" && !data.borrowerId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Please select a customer",
				path: ["borrowerId"],
			});
		}
		if (data.borrowerType === "employee" && !data.employeeId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Please select an employee",
				path: ["employeeId"],
			});
		}
	});

export type BorrowPaymentFormValues = z.infer<typeof borrowPaymentSchema>;

// Temporarily disabled: keep the cart memo helper in place for future reuse.
// function buildBorrowCartMemo(
// 	cart: Array<{
// 		name: string;
// 		code: string;
// 		qty: number;
// 	}>,
// ) {
// 	if (cart.length === 0) return "";

// 	const itemsSummary = cart
// 		.map((item) => `${item.name} (${item.code}) x${item.qty}`)
// 		.join(", ");

// 	return `Purchased items: ${itemsSummary}`;
// }

// do not automatically merge user memo with cart memo on submit.
// function mergeLoanMemo(userMemo: string, cartMemo: string) {
// 	const trimmedUserMemo = userMemo.trim();
// 	const trimmedCartMemo = cartMemo.trim();
//
// 	if (!trimmedCartMemo) return trimmedUserMemo;
// 	if (!trimmedUserMemo) return trimmedCartMemo;
// 	if (trimmedUserMemo.includes(trimmedCartMemo)) return trimmedUserMemo;
//
// 	return `${trimmedUserMemo} | ${trimmedCartMemo}`;
// }

export function useBorrowPaymentForm() {
	const navigate = useNavigate();
	// Temporarily disabled: keep the cart selector logic in place for future reuse.
	// const cart = useBorrowCartSelector((state) => state.cart);
	const { clearCart } = useBorrowCartActions();
	// const cartMemo = buildBorrowCartMemo(cart);

	const form = useForm<BorrowPaymentFormValues>({
		resolver: zodResolver(borrowPaymentSchema),
		defaultValues: {
			borrowerType: "customer",
			borrowerId: "",
			employeeId: "",
			loanCode: "",
			depositAmount: 0,
			monthlyAmount: 0,
			dueWarningDays: 5,
			dueDate: new Date(),
			memo: "",
		},
	});

	const { setValue, reset } = form;

	// Use useQuery for loan code generation (controlled mode)
	const { isFetching: isGeneratingCode, refetch: refetchLoanCode } = useQuery({
		queryKey: ["loan-code-generation", "borrow-payment-form"],
		queryFn: () => loanService.generateLoanCode(),
		enabled: false,
		staleTime: 0,
		refetchOnWindowFocus: false,
	});

	const applyGeneratedLoanCode = async (force = false) => {
		const loanCodeBeforeFetch = form.getValues("loanCode").trim();
		if (!force && loanCodeBeforeFetch) return;

		try {
			const result = await refetchLoanCode();
			const generatedCode = result.data?.code?.trim();
			if (!generatedCode) return;

			const loanCodeAfterFetch = form.getValues("loanCode").trim();
			if (!force && loanCodeAfterFetch !== loanCodeBeforeFetch) {
				return;
			}

			setValue("loanCode", generatedCode, { shouldValidate: true });
		} catch (e) {
			// Error handled
			if (import.meta.env.DEV) {
				console.error("Failed to generate loan code:", e);
			}
		}
	};

	const hasGeneratedCodeRef = useRef(false);

	// Initialize loan code on mount
	useEffect(() => {
		if (hasGeneratedCodeRef.current) return;
		hasGeneratedCodeRef.current = true;
		void applyGeneratedLoanCode(false);
	}, []);

	// Temporarily disabled: do not prefill the memo field from the borrow cart.
	// useEffect(() => {
	// 	if (!cartMemo) return;
	// 	if (form.getValues("memo").trim()) return;
	//
	// 	setValue("memo", cartMemo, { shouldValidate: true });
	// }, [cartMemo, form, setValue]);

	// Fetch Customers
	const { data: customers = [] } = useQuery({
		queryKey: ["customers-list"],
		queryFn: () => customerService.getCustomerList({ limit: 1000 }).then((res) => res.list),
	});

	// Fetch Employees
	const { data: employees = [] } = useQuery({
		queryKey: ["employees-list"],
		queryFn: () => employeeService.getEmployeeList(),
	});

	const { mutate: createLoan, isPending } = useMutation({
		mutationFn: loanService.createLoan,
		onSuccess: () => {
			toast.success("Loan created successfully!");
			clearCart();
			navigate("/dashboard/loan", { replace: true });
			reset();
		},
		onError: () => {
			toast.error("Failed to create loan");
		},
	});

	const confirm = (values: BorrowPaymentFormValues) => {
		const selectedBorrowerId = values.borrowerType === "customer" ? values.borrowerId! : values.employeeId!;
		const trimmedMemo = values.memo.trim();

		createLoan({
			code: values.loanCode.trim(),
			borrowerType: values.borrowerType,
			borrowerId: selectedBorrowerId,
			principalAmount: values.depositAmount,
			loanInstallmentAmount: values.monthlyAmount,
			dueWarningDays: values.dueWarningDays,
			startDate: formatDateStartLocalApiValue(values.dueDate),
			...(trimmedMemo ? { memo: trimmedMemo } : {}),
		});
	};

	return {
		form,
		isGeneratingCode,
		regenerateLoanCode: () => applyGeneratedLoanCode(true),
		confirm,
		isPending,
		customers,
		employees,
	};
}
