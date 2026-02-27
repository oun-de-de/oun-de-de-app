import { useMemo } from "react";
import type { InventoryItem } from "@/core/types/inventory";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";

type UpdateStockDialogProps = {
	item: InventoryItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	quantity: string;
	reason: string;
	memo: string;
	onQuantityChange: (value: string) => void;
	onReasonChange: (value: string) => void;
	onMemoChange: (value: string) => void;
	onSubmit: () => void;
	isPending?: boolean;
};

export function UpdateStockDialog({
	item,
	open,
	onOpenChange,
	quantity,
	reason,
	memo,
	onQuantityChange,
	onReasonChange,
	onMemoChange,
	onSubmit,
	isPending = false,
}: UpdateStockDialogProps) {
	const reasons = useMemo(
		() =>
			item.type === "CONSUMABLE"
				? [
						{ value: "purchase", label: "Purchase" },
						{ value: "consume", label: "Consume" },
					]
				: [
						{ value: "purchase", label: "Purchase" },
						{ value: "borrow", label: "Borrow" },
						{ value: "return", label: "Return" },
						{ value: "consume", label: "Consume" },
					],
		[item.type],
	);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-1">
					Update Stock
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Update Stock</DialogTitle>
				</DialogHeader>

				<div className="space-y-3">
					<div className="space-y-1.5">
						<Label>Item</Label>
						<Input value={`${item.name} (${item.code})`} disabled />
					</div>
					<div className="space-y-1.5">
						<Label>Reason</Label>
						<Select value={reason} onValueChange={onReasonChange}>
							<SelectTrigger>
								<SelectValue placeholder="Select reason" />
							</SelectTrigger>
							<SelectContent>
								{reasons.map((r) => (
									<SelectItem key={r.value} value={r.value}>
										{r.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1.5">
						<Label>Quantity</Label>
						<Input type="number" min={1} value={quantity} onChange={(e) => onQuantityChange(e.target.value)} />
					</div>
					<div className="space-y-1.5">
						<Label>Memo</Label>
						<Input value={memo} onChange={(e) => onMemoChange(e.target.value)} placeholder="Additional notes" />
					</div>
				</div>

				<DialogFooter>
					<Button onClick={onSubmit} disabled={isPending}>
						{isPending ? "Saving..." : "Update Stock"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
