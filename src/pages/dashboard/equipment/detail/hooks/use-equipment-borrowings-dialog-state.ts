import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { SellEquipmentRequest } from "@/core/types/inventory";
import { useReturnBorrowing, useSellBorrowing } from "../../hooks/use-inventory-mutations";

export type PendingBorrowingAction =
	| { type: "sell"; borrowingId: string; customerName: string }
	| { type: "return"; borrowingId: string; customerName: string }
	| null;

export type SellRefCodeMode = "auto" | "manual";

const SELL_REF_CODE_PREFIX = "SAL";

function createNextSellRefCode(date = new Date()): string {
	const datePart = [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
	].join("");
	const timePart = [String(date.getHours()).padStart(2, "0"), String(date.getMinutes()).padStart(2, "0"), String(date.getSeconds()).padStart(2, "0")].join("");

	return `${SELL_REF_CODE_PREFIX}-${datePart}-${timePart}`;
}

export function useEquipmentBorrowingsDialogState(itemId: string) {
	const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
	const [historyPage, setHistoryDialogPage] = useState(1);
	const [historyPageSize, setHistoryPageSize] = useState(20);
	const [pendingAction, setPendingAction] = useState<PendingBorrowingAction>(null);
	const [sellRefCodeMode, setSellRefCodeMode] = useState<SellRefCodeMode>("auto");
	const [sellRefCode, setSellRefCode] = useState("");
	const [sellExpense, setSellExpense] = useState("");
	const hasGeneratedSellRefCodeRef = useRef(false);

	const returnBorrowing = useReturnBorrowing(itemId);
	const sellBorrowing = useSellBorrowing(itemId);

	const isPending = sellBorrowing.isPending || returnBorrowing.isPending;

	const resetSellForm = useCallback(() => {
		hasGeneratedSellRefCodeRef.current = false;
		setSellRefCodeMode("auto");
		setSellRefCode("");
		setSellExpense("");
	}, []);

	const applyGeneratedSellRefCode = useCallback(
		(force = false) => {
			if (!pendingAction || pendingAction.type !== "sell") return;
			if (!force && hasGeneratedSellRefCodeRef.current) return;

			hasGeneratedSellRefCodeRef.current = true;
			setSellRefCode(createNextSellRefCode());
		},
		[pendingAction],
	);

	const resetAllDialogs = useCallback(() => {
		resetSellForm();
		setPendingAction(null);
		setHistoryDialogPage(1);
		setIsHistoryDialogOpen(false);
	}, [resetSellForm]);

	const openHistoryDialog = useCallback(() => {
		setHistoryDialogPage(1);
		setIsHistoryDialogOpen(true);
	}, []);

	const openSellAction = useCallback(
		(borrowingId: string, customerName: string) => {
			resetSellForm();
			setPendingAction({
				type: "sell",
				borrowingId,
				customerName,
			});
		},
		[resetSellForm],
	);

	const openReturnAction = useCallback(
		(borrowingId: string, customerName: string) => {
			resetSellForm();
			setPendingAction({
				type: "return",
				borrowingId,
				customerName,
			});
		},
		[resetSellForm],
	);

	const closePendingAction = useCallback(() => {
		resetSellForm();
		setPendingAction(null);
	}, [resetSellForm]);

	useEffect(() => {
		if (pendingAction?.type === "sell" && sellRefCodeMode === "auto") {
			applyGeneratedSellRefCode(false);
		}
	}, [applyGeneratedSellRefCode, pendingAction, sellRefCodeMode]);

	const confirmPendingAction = useCallback(() => {
		if (!pendingAction) return;

		if (pendingAction.type === "sell") {
			const refCode = sellRefCode.trim();
			if (!refCode) {
				toast.error("Reference code is required");
				return;
			}

			const parsedExpense = sellExpense.trim() === "" ? undefined : Number(sellExpense);
			if (parsedExpense !== undefined && (!Number.isFinite(parsedExpense) || parsedExpense < 0)) {
				toast.error("Expense must be 0 or greater");
				return;
			}

			const data: SellEquipmentRequest = {
				refCode,
				...(parsedExpense !== undefined ? { expense: parsedExpense } : {}),
			};

			sellBorrowing.mutate(
				{ borrowingId: pendingAction.borrowingId, data },
				{
					onSuccess: () => {
						closePendingAction();
					},
				},
			);
			return;
		}

		returnBorrowing.mutate(pendingAction.borrowingId, {
			onSuccess: () => {
				closePendingAction();
			},
		});
	}, [closePendingAction, pendingAction, returnBorrowing, sellBorrowing, sellExpense, sellRefCode]);

	return {
		isHistoryDialogOpen,
		setIsHistoryDialogOpen,
		openHistoryDialog,
		historyPage,
		setHistoryDialogPage,
		historyPageSize,
		setHistoryPageSize,
		pendingAction,
		sellRefCodeMode,
		setSellRefCodeMode,
		sellRefCode,
		setSellRefCode,
		sellExpense,
		setSellExpense,
		isPending,
		returnBorrowing,
		sellBorrowing,
		resetAllDialogs,
		openSellAction,
		openReturnAction,
		closePendingAction,
		confirmPendingAction,
		regenerateSellRefCode: () => applyGeneratedSellRefCode(true),
	};
}
