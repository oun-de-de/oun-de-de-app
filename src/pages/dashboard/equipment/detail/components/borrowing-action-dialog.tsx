import type { PendingBorrowingAction } from "../hooks/use-equipment-borrowings-dialog-state";
import { Button } from "@/core/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";

type BorrowingActionDialogProps = {
	pendingAction: PendingBorrowingAction;
	sellRefCode: string;
	onSellRefCodeChange: (value: string) => void;
	sellExpense: string;
	onSellExpenseChange: (value: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
	isPending: boolean;
};

export function BorrowingActionDialog({
	pendingAction,
	sellRefCode,
	onSellRefCodeChange,
	sellExpense,
	onSellExpenseChange,
	onConfirm,
	onCancel,
	isPending,
}: BorrowingActionDialogProps) {
	return (
		<Dialog open={pendingAction !== null} onOpenChange={isPending ? undefined : (open) => !open && onCancel()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{pendingAction?.type === "sell" ? "Confirm Sale" : "Confirm Return"}</DialogTitle>
					<DialogDescription>
						{pendingAction?.type === "sell"
							? `Mark this borrowing for ${pendingAction.customerName} as sold?`
							: `Mark this borrowing for ${pendingAction?.customerName} as returned?`}
					</DialogDescription>
				</DialogHeader>
				{pendingAction?.type === "sell" ? (
					<div className="grid grid-cols-1 gap-3">
						<div className="space-y-2">
							<Label htmlFor="sell-ref-code">Reference Code</Label>
							<Input
								id="sell-ref-code"
								value={sellRefCode}
								onChange={(event) => onSellRefCodeChange(event.target.value)}
								placeholder="Enter sale reference code"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="sell-expense">Expense</Label>
							<Input
								id="sell-expense"
								type="number"
								min={0}
								step="0.01"
								value={sellExpense}
								onChange={(event) => onSellExpenseChange(event.target.value)}
								placeholder="Optional selling expense"
							/>
						</div>
					</div>
				) : null}
				<DialogFooter>
					<Button variant="outline" onClick={onCancel} disabled={isPending}>
						Cancel
					</Button>
					<Button onClick={onConfirm} disabled={isPending}>
						{isPending ? "Saving…" : "Confirm"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
