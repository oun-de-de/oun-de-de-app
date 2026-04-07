import { useDialogSubmitHandler } from "@/core/hooks/use-dialog-submit-handler";
import type { CurrentLoanDue } from "./use-borrow-detail";
import type { Loan } from "@/core/types/loan";
import { useCallback, useRef, useState } from "react";

type UseBorrowDetailDialogsParams = {
	currentDue: CurrentLoanDue | null;
	loan?: Loan | null;
	createPayment: (params: { code: string; amount: number; shouldUpdateDueDate: boolean }) => Promise<unknown>;
	extendLoan: (amount: number) => Promise<unknown>;
	updateLoan: (params: { installmentAmount: number; dueWarningDays: number }) => Promise<unknown>;
	postponeLoan: () => Promise<unknown>;
	regeneratePaymentCode: () => Promise<{ data?: { code?: string | null } }>;
};

export function useBorrowDetailDialogs({
	currentDue,
	loan,
	createPayment,
	extendLoan,
	updateLoan,
	postponeLoan,
	regeneratePaymentCode,
}: UseBorrowDetailDialogsParams) {
	const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
	const [shouldUpdateDueDate, setShouldUpdateDueDate] = useState(true);
	const [paymentCode, setPaymentCode] = useState("");
	const [paymentAmount, setPaymentAmount] = useState("");
	const [isBorrowMoreDialogOpen, setIsBorrowMoreDialogOpen] = useState(false);
	const [additionalAmount, setAdditionalAmount] = useState("");
	const [isEditTermsDialogOpen, setIsEditTermsDialogOpen] = useState(false);
	const [isPostponeDialogOpen, setIsPostponeDialogOpen] = useState(false);
	const [installmentAmountInput, setInstallmentAmountInput] = useState("");
	const [dueWarningDaysInput, setDueWarningDaysInput] = useState("");
	const paymentCodeRef = useRef(paymentCode);

	const setPaymentCodeValue = useCallback((value: string) => {
		paymentCodeRef.current = value;
		setPaymentCode(value);
	}, []);

	const applyGeneratedPaymentCode = useCallback(
		async (force = false) => {
			const paymentCodeBeforeFetch = paymentCodeRef.current.trim();
			const result = await regeneratePaymentCode();
			const generatedCode = result.data?.code?.trim();
			if (!generatedCode) return;

			const paymentCodeAfterFetch = paymentCodeRef.current.trim();
			if (!force && paymentCodeAfterFetch !== paymentCodeBeforeFetch) {
				return;
			}

			setPaymentCodeValue(generatedCode);
		},
		[regeneratePaymentCode, setPaymentCodeValue],
	);

	const resetPaymentDialog = useCallback(() => {
		setIsPaymentDialogOpen(false);
		setShouldUpdateDueDate(true);
		setPaymentCodeValue("");
		setPaymentAmount(currentDue ? String(currentDue.amount) : "");
	}, [currentDue, setPaymentCodeValue]);

	const resetBorrowMoreDialog = useCallback(() => {
		setIsBorrowMoreDialogOpen(false);
		setAdditionalAmount("");
	}, []);

	const resetEditTermsDialog = useCallback(() => {
		setIsEditTermsDialogOpen(false);
	}, []);

	const resetPostponeDialog = useCallback(() => {
		setIsPostponeDialogOpen(false);
	}, []);

	const submitPaymentAndClose = useDialogSubmitHandler({
		closeDialog: resetPaymentDialog,
	});
	const submitBorrowMoreAndClose = useDialogSubmitHandler({
		closeDialog: resetBorrowMoreDialog,
	});
	const submitEditTermsAndClose = useDialogSubmitHandler({
		closeDialog: resetEditTermsDialog,
	});
	const submitPostponeAndClose = useDialogSubmitHandler({
		closeDialog: resetPostponeDialog,
	});

	const openPaymentDialog = useCallback(() => {
		setPaymentCodeValue("");
		setPaymentAmount(currentDue ? String(currentDue.amount) : "");
		setShouldUpdateDueDate(true);
		setIsPaymentDialogOpen(true);
		void applyGeneratedPaymentCode(false);
	}, [applyGeneratedPaymentCode, currentDue, setPaymentCodeValue]);

	const handleCreatePayment = useCallback(async () => {
		const parsedAmount = Number(paymentAmount);
		if (!currentDue || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
		if (!paymentCode.trim()) return;
		await submitPaymentAndClose(() =>
			createPayment({
				code: paymentCode.trim(),
				amount: parsedAmount,
				shouldUpdateDueDate,
			}),
		);
	}, [createPayment, currentDue, paymentAmount, paymentCode, shouldUpdateDueDate, submitPaymentAndClose]);

	const handleBorrowMore = useCallback(async () => {
		const parsedAmount = Number(additionalAmount);
		if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
		await submitBorrowMoreAndClose(() => extendLoan(parsedAmount));
	}, [additionalAmount, extendLoan, submitBorrowMoreAndClose]);

	const openEditTermsDialog = useCallback(() => {
		if (!loan || loan.status === "complete") return;
		setInstallmentAmountInput(String(loan.installmentAmount ?? ""));
		setDueWarningDaysInput(String(loan.dueWarningDays ?? 5));
		setIsEditTermsDialogOpen(true);
	}, [loan]);

	const handleUpdateLoanTerms = useCallback(async () => {
		const parsedInstallmentAmount = Number(installmentAmountInput);
		const parsedDueWarningDays = Number(dueWarningDaysInput);
		if (!Number.isFinite(parsedInstallmentAmount) || parsedInstallmentAmount <= 0) return;
		if (!Number.isFinite(parsedDueWarningDays) || parsedDueWarningDays < 0 || parsedDueWarningDays > 29) return;

		await submitEditTermsAndClose(() =>
			updateLoan({
				installmentAmount: parsedInstallmentAmount,
				dueWarningDays: parsedDueWarningDays,
			}),
		);
	}, [dueWarningDaysInput, installmentAmountInput, submitEditTermsAndClose, updateLoan]);

	const handlePostponeLoan = useCallback(async () => {
		await submitPostponeAndClose(() => postponeLoan());
	}, [postponeLoan, submitPostponeAndClose]);

	return {
		isPaymentDialogOpen,
		setIsPaymentDialogOpen,
		shouldUpdateDueDate,
		setShouldUpdateDueDate,
		paymentCode,
		setPaymentCodeValue,
		paymentAmount,
		setPaymentAmount,
		isBorrowMoreDialogOpen,
		setIsBorrowMoreDialogOpen,
		additionalAmount,
		setAdditionalAmount,
		isEditTermsDialogOpen,
		setIsEditTermsDialogOpen,
		isPostponeDialogOpen,
		setIsPostponeDialogOpen,
		installmentAmountInput,
		setInstallmentAmountInput,
		dueWarningDaysInput,
		setDueWarningDaysInput,
		applyGeneratedPaymentCode,
		openPaymentDialog,
		openEditTermsDialog,
		handleCreatePayment,
		handleBorrowMore,
		handleUpdateLoanTerms,
		handlePostponeLoan,
		resetPaymentDialog,
		resetBorrowMoreDialog,
	};
}
