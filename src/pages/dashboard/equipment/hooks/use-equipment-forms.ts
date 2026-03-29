import { useCallback, useState } from "react";
import { useCreateBorrowing, useCreateItem, useUpdateStock } from "./use-inventory-mutations";

function toLocalMidnightDateTime(dateValue: string): string | undefined {
	if (!dateValue) return undefined;
	return `${dateValue}T00:00:00`;
}

export function useEquipmentForms(itemId?: string) {
	const updateStockMutation = useUpdateStock(itemId);
	const createBorrowingMutation = useCreateBorrowing(itemId);
	const createItemMutation = useCreateItem();

	const [stockInQty, setStockInQty] = useState("1");
	const [stockInNote, setStockInNote] = useState("");
	const [stockInReason, setStockInReason] = useState("purchase");
	const [stockInExpense, setStockInExpense] = useState("");

	const resetStockInForm = useCallback(() => {
		setStockInQty("1");
		setStockInNote("");
		setStockInReason("purchase");
		setStockInExpense("");
	}, []);

	const handleStockIn = useCallback(() => {
		const parsedExpense = Number(stockInExpense);
		updateStockMutation.mutate(
			{
				quantity: Number(stockInQty),
				reason: stockInReason,
				memo: stockInNote,
				...(Number.isFinite(parsedExpense) && parsedExpense > 0 ? { expense: parsedExpense } : {}),
			},
			{ onSuccess: resetStockInForm },
		);
	}, [resetStockInForm, stockInExpense, stockInNote, stockInQty, stockInReason, updateStockMutation]);

	const [borrowQty, setBorrowQty] = useState("1");
	const [borrowCustomerId, setBorrowCustomerId] = useState("");
	const [borrowExpectedReturnDate, setBorrowExpectedReturnDate] = useState("");
	const [borrowMemo, setBorrowMemo] = useState("");

	const resetBorrowForm = useCallback(() => {
		setBorrowQty("1");
		setBorrowCustomerId("");
		setBorrowExpectedReturnDate("");
		setBorrowMemo("");
	}, []);

	const handleBorrow = useCallback(() => {
		const expectedReturnDate = toLocalMidnightDateTime(borrowExpectedReturnDate);
		if (!expectedReturnDate) return;

		createBorrowingMutation.mutate(
			{
				customerId: borrowCustomerId,
				quantity: Number(borrowQty),
				expectedReturnDate,
				memo: borrowMemo,
			},
			{ onSuccess: resetBorrowForm },
		);
	}, [borrowCustomerId, borrowExpectedReturnDate, borrowMemo, borrowQty, createBorrowingMutation, resetBorrowForm]);

	return {
		stockIn: {
			qty: stockInQty,
			note: stockInNote,
			reason: stockInReason,
			expense: stockInExpense,
			setQty: setStockInQty,
			setNote: setStockInNote,
			setReason: setStockInReason,
			setExpense: setStockInExpense,
			submit: handleStockIn,
			isPending: updateStockMutation.isPending,
		},
		borrow: {
			qty: borrowQty,
			customerId: borrowCustomerId,
			expectedReturnDate: borrowExpectedReturnDate,
			memo: borrowMemo,
			setQty: setBorrowQty,
			setCustomerId: setBorrowCustomerId,
			setExpectedReturnDate: setBorrowExpectedReturnDate,
			setMemo: setBorrowMemo,
			submit: handleBorrow,
			isPending: createBorrowingMutation.isPending,
		},
		createItem: {
			mutate: createItemMutation.mutate,
			isPending: createItemMutation.isPending,
		},
	};
}
