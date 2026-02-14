import Icon from "@/core/components/icon/icon";
import type { EquipmentItem, EquipmentItemId } from "@/core/types/equipment";
import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Text } from "@/core/ui/typography";

type StockOutBorrowFormProps = {
	items: EquipmentItem[];
	itemId: EquipmentItemId;
	quantity: string;
	customerName: string;
	onItemChange: (value: EquipmentItemId) => void;
	onQuantityChange: (value: string) => void;
	onCustomerNameChange: (value: string) => void;
	onSubmit: () => void;
	hideItemSelector?: boolean;
};

export function StockOutBorrowForm({
	items,
	itemId,
	quantity,
	customerName,
	onItemChange,
	onQuantityChange,
	onCustomerNameChange,
	onSubmit,
	hideItemSelector = false,
}: StockOutBorrowFormProps) {
	return (
		<div className="rounded-lg border border-orange-200 bg-orange-50/30 p-4 space-y-3">
			<div className="flex items-center gap-2 mb-1">
				<Icon icon="mdi:package-variant-minus" className="text-orange-600" />
				<Text variant="body1" className="font-semibold text-orange-900">
					Remove Stock
				</Text>
			</div>
			<div className="space-y-1.5">
				<Label>Reference / Note</Label>
				<Input
					value={customerName}
					onChange={(e) => onCustomerNameChange(e.target.value)}
					placeholder="Customer name, project, or reason"
				/>
			</div>
			{!hideItemSelector && (
				<div className="space-y-1.5">
					<Label>Item</Label>
					<Select value={itemId} onValueChange={(value) => onItemChange(value as EquipmentItemId)}>
						<SelectTrigger>
							<SelectValue placeholder="Select item" />
						</SelectTrigger>
						<SelectContent>
							{items.map((item) => (
								<SelectItem key={item.id} value={item.id}>
									{item.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
			<div className="space-y-1.5">
				<Label>Quantity</Label>
				<Input type="number" min={1} value={quantity} onChange={(e) => onQuantityChange(e.target.value)} />
			</div>
			<Button variant="warning" className="w-full" onClick={onSubmit}>
				<Icon icon="mdi:minus" className="mr-1" />
				Remove Stock
			</Button>
		</div>
	);
}
