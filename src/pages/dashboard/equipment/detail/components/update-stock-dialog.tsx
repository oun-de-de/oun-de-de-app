import type { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import type { InventoryItem } from "@/core/types/inventory";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { cn } from "@/core/utils";
import { ChoiceChips } from "@/pages/sale/new/components/filters";

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

const REASON_OPTIONS = [
	{
		label: "Purchase",
		value: "purchase",
		description: "Stock increase due to purchasing new items",
	},
	{
		label: "Consume",
		value: "consume",
		description: "Stock decrease due to consuming or using items",
	},
];

function getReasonVariant(reason: string) {
	const normalized = reason.toUpperCase();
	if (normalized === "PURCHASE") return "info" as const;
	if (normalized === "BORROW") return "warning" as const;
	if (normalized === "CONSUME") return "destructive" as const;
	return "default" as const;
}

const CHOICE_CHIPS_OPTIONS: SaleCategory[] = REASON_OPTIONS.map((option) => ({
	id: option.label,
	name: option.value,
	description: option.description,
}));

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

				<div className="space-y-4 py-2">
					<div className="space-y-1.5">
						<Label>Item</Label>
						<Input value={`${item.name} (${item.code})`} disabled />
					</div>
					<div className="space-y-1.5">
						<Label>Reason</Label>
						<div className="grid gap-2">
							<ChoiceChips
								options={CHOICE_CHIPS_OPTIONS}
								value={CHOICE_CHIPS_OPTIONS.filter((option) => option.name === reason)}
								onChange={(next) => onReasonChange(next[0]?.name ?? reason)}
								selectionMode="single"
								renderLabel={(option) => {
									const matched = REASON_OPTIONS.find((item) => item.value === option.name);
									return matched?.label ?? option.name;
								}}
								inactiveClassName="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
								getChipClassName={(option, isActive) => {
									if (!isActive) return undefined;
									const variant = getReasonVariant(option.name);
									return cn(
										"rounded-md border-none px-2 py-1 text-xs text-white shadow-sm",
										variant === "info" && "bg-gradient-to-r from-info to-info/80",
										variant === "warning" && "bg-gradient-to-r from-warning to-warning/80",
										variant === "destructive" && "bg-gradient-to-r from-destructive to-destructive/80",
										variant === "default" && "bg-gradient-to-r from-primary to-primary/80",
									);
								}}
							/>
							<p className="text-xs text-slate-500">
								{REASON_OPTIONS.find((option) => option.value === reason)?.description ??
									"Select a reason for this stock update"}
							</p>
						</div>
					</div>
					<div className="space-y-1.5">
						<Label>Quantity</Label>
						<Input type="number" min={1} value={quantity} onChange={(e) => onQuantityChange(e.target.value)} />
					</div>
					<div className="space-y-1.5">
						<Label>Description</Label>
						<Input
							value={memo}
							onChange={(e) => onMemoChange(e.target.value)}
							placeholder="Describe this stock update"
						/>
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
