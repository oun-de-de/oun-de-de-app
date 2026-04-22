import { RefreshCw } from "lucide-react";
import type { PendingBorrowingAction, SellRefCodeMode } from "../hooks/use-equipment-borrowings-dialog-state";
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
import { Switch } from "@/core/ui/switch";
import { cn } from "@/core/utils";

type BorrowingActionDialogProps = {
	pendingAction: PendingBorrowingAction;
	sellRefCodeMode: SellRefCodeMode;
	onSellRefCodeModeChange: (value: SellRefCodeMode) => void;
	sellRefCode: string;
	onSellRefCodeChange: (value: string) => void;
	onRegenerateSellRefCode: () => void;
	sellExpense: string;
	onSellExpenseChange: (value: string) => void;
	onConfirm: () => void;
	onCancel: () => void;
	isPending: boolean;
};

export function BorrowingActionDialog({
	pendingAction,
	sellRefCodeMode,
	onSellRefCodeModeChange,
	sellRefCode,
	onSellRefCodeChange,
	onRegenerateSellRefCode,
	sellExpense,
	onSellExpenseChange,
	onConfirm,
	onCancel,
	isPending,
}: BorrowingActionDialogProps) {
	return (
		<Dialog open={pendingAction !== null} onOpenChange={isPending ? undefined : (open) => !open && onCancel()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader className="space-y-2 pr-6">
					<DialogTitle className="text-2xl font-semibold text-slate-900">
						{pendingAction?.type === "sell" ? "Confirm Sale" : "Confirm Return"}
					</DialogTitle>
					<DialogDescription className="text-base leading-7 text-slate-500">
						{pendingAction?.type === "sell"
							? `Mark this borrowing for ${pendingAction.customerName} as sold?`
							: `Mark this borrowing for ${pendingAction?.customerName} as returned?`}
					</DialogDescription>
				</DialogHeader>
				{pendingAction?.type === "sell" ? (
					<div className="grid grid-cols-1 gap-4">
						<div className="space-y-2.5">
							<div className="flex items-center justify-between gap-4">
								<Label htmlFor="sell-ref-code" className="text-sm font-semibold text-slate-800">
									Reference Code
								</Label>
								<div className="flex items-center gap-2">
									<span className={cn("text-xs", sellRefCodeMode === "auto" ? "text-slate-400" : "font-medium text-slate-600")}>
										Manual
									</span>
									<Switch
										checked={sellRefCodeMode === "auto"}
										onCheckedChange={(checked) => onSellRefCodeModeChange(checked ? "auto" : "manual")}
									/>
									<span className={cn("text-xs", sellRefCodeMode === "auto" ? "font-medium text-blue-600" : "text-slate-400")}>
										Auto
									</span>
								</div>
							</div>
							<div className="relative">
								<Input
									id="sell-ref-code"
									value={sellRefCode}
									onChange={(event) => onSellRefCodeChange(event.target.value)}
									placeholder={sellRefCodeMode === "auto" ? "Auto-generated" : "Enter sale reference code"}
									className={cn("h-11 bg-white", sellRefCodeMode === "auto" && "pr-10")}
								/>
								{sellRefCodeMode === "auto" ? (
									<button
										type="button"
										onClick={onRegenerateSellRefCode}
										className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
										title="Regenerate code"
									>
										<RefreshCw className="h-3.5 w-3.5" />
									</button>
								) : null}
							</div>
							<p className="text-sm leading-6 text-slate-500">
								{sellRefCode.trim()
									? `Enter "${sellRefCode.trim()}" to confirm and record this borrowing as sold.`
									: "Enter the sale ref code to confirm and record this borrowing as sold."}
							</p>
						</div>
						<div className="space-y-2.5">
							<Label htmlFor="sell-expense" className="text-sm font-semibold text-slate-800">
								Expense
							</Label>
							<Input
								id="sell-expense"
								type="number"
								min={0}
								step="0.01"
								value={sellExpense}
								onChange={(event) => onSellExpenseChange(event.target.value)}
								placeholder="Optional selling expense"
								className="h-11 bg-white"
							/>
						</div>
					</div>
				) : null}
				<DialogFooter className="gap-3 sm:justify-end">
					<Button variant="outline" onClick={onCancel} disabled={isPending} className="min-w-32">
						Cancel
					</Button>
					<Button onClick={onConfirm} disabled={isPending} className="min-w-32">
						{isPending ? "Saving…" : "Confirm"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
