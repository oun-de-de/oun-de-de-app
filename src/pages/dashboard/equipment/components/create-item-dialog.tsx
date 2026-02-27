import { useState } from "react";
import Icon from "@/core/components/icon/icon";
import type { EquipmentCreateType } from "@/core/types/equipment";
import type { CreateInventoryItem } from "@/core/types/inventory";
import { Button } from "@/core/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { useGetUnitList } from "../../settings/hooks/use-settings";

type CreateItemDialogProps = {
	onSubmit: (data: CreateInventoryItem) => void;
	isPending?: boolean;
};

export function CreateItemDialog({ onSubmit, isPending }: CreateItemDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [type, setType] = useState<EquipmentCreateType>("consumable");
	const [unitId, setUnitId] = useState("");
	const [quantityOnHand, setQuantityOnHand] = useState("0");
	const [alertThreshold, setAlertThreshold] = useState("0");
	const { data: units } = useGetUnitList();

	const resetForm = () => {
		setName("");
		setType("consumable");
		setUnitId("");
		setQuantityOnHand("0");
		setAlertThreshold("0");
	};

	const handleSubmit = () => {
		onSubmit({
			name,
			type,
			unitId,
			quantityOnHand: Number(quantityOnHand),
			alertThreshold: Number(alertThreshold),
		});
		resetForm();
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-1">
					<Icon icon="mdi:plus" />
					New Item
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New Item</DialogTitle>
					<DialogDescription>Add a new inventory item to track stock.</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="space-y-2">
						<Label htmlFor="item-name">Name</Label>
						<Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="item-type">Type</Label>
						<Select value={type} onValueChange={(v) => setType(v as EquipmentCreateType)}>
							<SelectTrigger id="item-type" className="w-full">
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="consumable">Consumable (Stock)</SelectItem>
								<SelectItem value="equipment">Equipment (Borrowable)</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label htmlFor="item-unit-id">Unit</Label>
						<Select value={unitId} onValueChange={setUnitId}>
							<SelectTrigger id="item-unit-id" className="w-full">
								<SelectValue placeholder="Select unit" />
							</SelectTrigger>
							<SelectContent>
								{units?.map((unit) => (
									<SelectItem key={unit.id} value={unit.id}>
										{unit.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="item-qty">Initial Quantity</Label>
							<Input
								id="item-qty"
								type="number"
								min={0}
								value={quantityOnHand}
								onChange={(e) => setQuantityOnHand(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="item-threshold">Alert Threshold</Label>
							<Input
								id="item-threshold"
								type="number"
								min={0}
								value={alertThreshold}
								onChange={(e) => setAlertThreshold(e.target.value)}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isPending || !name}>
						{isPending ? "Creating..." : "Create Item"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
