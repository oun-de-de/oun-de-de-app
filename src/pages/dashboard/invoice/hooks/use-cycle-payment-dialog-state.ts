import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import cycleService from "@/core/api/services/cycle-service";
import loanService from "@/core/api/services/loan-service";
import type { Cycle, CyclePayment } from "@/core/types/cycle";

type PaymentFormValues = {
	paymentCode: string;
	amount: string;
	paymentDateTime: string;
};

type LoanFormValues = {
	loanCode: string;
	loanStartDate: string;
	monthlyAmount: string;
	dueWarningDays: string;
};

type UseCyclePaymentDialogStateParams = {
	open: boolean;
	cycle: Cycle | null;
	defaultTab: "payment" | "loan";
	historyOnly: boolean;
	payments: CyclePayment[];
	isLoadingPayments: boolean;
	paymentForm: UseFormReturn<PaymentFormValues>;
	loanForm: UseFormReturn<LoanFormValues>;
	createPaymentFormDefaults: () => PaymentFormValues;
	createLoanFormDefaults: () => LoanFormValues;
};

export function useCyclePaymentDialogState({
	open,
	cycle,
	defaultTab,
	historyOnly,
	payments,
	isLoadingPayments,
	paymentForm,
	loanForm,
	createPaymentFormDefaults,
	createLoanFormDefaults,
}: UseCyclePaymentDialogStateParams) {
	const [activeTab, setActiveTab] = useState<"payment" | "loan">(defaultTab);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const hasGeneratedPaymentCodeRef = useRef(false);
	const hasGeneratedLoanCodeRef = useRef(false);

	const totalPaidAmount = isLoadingPayments
		? (cycle?.totalPaidAmount ?? 0)
		: payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
	const cycleBalance = Math.max(0, (cycle?.totalAmount ?? 0) - totalPaidAmount);
	const totalPages = Math.ceil(payments.length / pageSize) || 1;
	const pagedData = useMemo(() => payments.slice((page - 1) * pageSize, page * pageSize), [payments, page, pageSize]);

	useEffect(() => {
		if (page > totalPages) {
			setPage(totalPages);
		}
	}, [page, totalPages]);

	const { refetch: refetchPaymentCode, isFetching: isFetchingPaymentCode } = useQuery({
		queryKey: ["payment-code", "cycle-payment-dialog", cycle?.id],
		queryFn: () => cycleService.generatePaymentCode(),
		enabled: false,
		staleTime: 0,
		refetchOnWindowFocus: false,
	});

	const applyGeneratedPaymentCode = async (force = false) => {
		if (!cycle || historyOnly) return;
		if (!force && hasGeneratedPaymentCodeRef.current) return;

		try {
			const paymentCodeBeforeFetch = paymentForm.getValues("paymentCode").trim();
			const result = await refetchPaymentCode();
			const generatedCode = result.data?.code?.trim();
			if (!generatedCode) {
				hasGeneratedPaymentCodeRef.current = false;
				toast.error("Failed to auto-generate payment code");
				return;
			}

			const paymentCodeAfterFetch = paymentForm.getValues("paymentCode").trim();
			if (!force && paymentCodeAfterFetch !== paymentCodeBeforeFetch) {
				hasGeneratedPaymentCodeRef.current = false;
				return;
			}

			hasGeneratedPaymentCodeRef.current = true;
			paymentForm.setValue("paymentCode", generatedCode, { shouldValidate: true });
		} catch (error) {
			hasGeneratedPaymentCodeRef.current = false;
			console.error("Failed to generate payment code:", error);
			toast.error("Failed to auto-generate payment code");
		}
	};

	const { refetch: refetchLoanCode, isFetching: isFetchingLoanCode } = useQuery({
		queryKey: ["loan-code", "cycle-payment-dialog", cycle?.id],
		queryFn: () => loanService.generateLoanCode(),
		enabled: false,
		staleTime: 0,
		refetchOnWindowFocus: false,
	});

	const applyGeneratedLoanCode = async (force = false) => {
		if (!cycle || historyOnly) return;
		if (!force && hasGeneratedLoanCodeRef.current) return;

		try {
			const loanCodeBeforeFetch = loanForm.getValues("loanCode").trim();
			const result = await refetchLoanCode();
			const generatedCode = result.data?.code?.trim();
			if (!generatedCode) {
				hasGeneratedLoanCodeRef.current = false;
				toast.error("Failed to auto-generate loan code");
				return;
			}

			const loanCodeAfterFetch = loanForm.getValues("loanCode").trim();
			if (!force && loanCodeAfterFetch !== loanCodeBeforeFetch) {
				hasGeneratedLoanCodeRef.current = false;
				return;
			}

			hasGeneratedLoanCodeRef.current = true;
			loanForm.setValue("loanCode", generatedCode, { shouldValidate: true });
		} catch (error) {
			hasGeneratedLoanCodeRef.current = false;
			console.error("Failed to generate loan code:", error);
			toast.error("Failed to auto-generate loan code");
		}
	};

	useEffect(() => {
		if (!open) {
			hasGeneratedPaymentCodeRef.current = false;
			hasGeneratedLoanCodeRef.current = false;
			return;
		}

		hasGeneratedPaymentCodeRef.current = false;
		hasGeneratedLoanCodeRef.current = false;
		setActiveTab(defaultTab);
		setPage(1);
		paymentForm.reset(createPaymentFormDefaults());
		loanForm.reset(createLoanFormDefaults());
	}, [open, cycle?.id, defaultTab, paymentForm, loanForm, createPaymentFormDefaults, createLoanFormDefaults]);

	useEffect(() => {
		if (open && cycle && activeTab === "payment" && !historyOnly) {
			void applyGeneratedPaymentCode(false);
		}
	}, [open, cycle, activeTab, historyOnly]);

	useEffect(() => {
		if (open && cycle && activeTab === "loan" && !historyOnly) {
			void applyGeneratedLoanCode(false);
		}
	}, [open, cycle, activeTab, historyOnly]);

	useEffect(() => {
		if (!open || activeTab !== "payment" || isFetchingPaymentCode) return;
		if (!paymentForm.getValues("paymentCode")) {
			paymentForm.setFocus("paymentCode");
		}
	}, [open, activeTab, isFetchingPaymentCode, paymentForm]);

	useEffect(() => {
		if (!open || activeTab !== "loan" || isFetchingLoanCode) return;
		if (!loanForm.getValues("loanCode")) {
			loanForm.setFocus("loanCode");
		}
	}, [open, activeTab, isFetchingLoanCode, loanForm]);

	return {
		activeTab,
		setActiveTab,
		page,
		setPage,
		pageSize,
		setPageSize,
		pagedData,
		totalPages,
		totalPaidAmount,
		cycleBalance,
		isFetchingPaymentCode,
		applyGeneratedPaymentCode,
		isFetchingLoanCode,
		applyGeneratedLoanCode,
	};
}
