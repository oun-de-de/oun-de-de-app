import { useState } from "react";
import type { EquipmentCreateType } from "@/core/types/equipment";
import type { CreateInventoryItem, InventoryItemType } from "@/core/types/inventory";
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
	const [alertThreshold, setAlertThreshold] = useState("0");
	const [refCode, setRefCode] = useState("");
	const [quantityOnHand, setQuantityOnHand] = useState("0");
	const [expense, setExpense] = useState("");
	const { data: units } = useGetUnitList();

	const resetForm = () => {
		setName("");
		setType("consumable");
		setUnitId("");
		setAlertThreshold("0");
		setRefCode("");
		setQuantityOnHand("0");
		setExpense("");
	};
	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			resetForm();
		}
		setOpen(nextOpen);
	};

	const handleSubmit = () => {
		const mappedType: InventoryItemType = type === "equipment" ? "EQUIPMENT" : "CONSUMABLE";
		const parsedQuantityOnHand = Number(quantityOnHand);
		const parsedAlertThreshold = Number(alertThreshold);
		const parsedExpense = Number(expense);
		const normalizedName = name.trim();
		const normalizedRefCode = refCode.trim();

		onSubmit({
			name: normalizedName,
			type: mappedType,
			...(unitId ? { unitId } : {}),
			...(normalizedRefCode
				? {
						initStock: {
							refCode: normalizedRefCode,
							quantityOnHand: parsedQuantityOnHand,
							...(Number.isFinite(parsedExpense) && parsedExpense > 0 ? { expense: parsedExpense } : {}),
						},
					}
				: {}),
			...(Number.isFinite(parsedAlertThreshold) ? { alertThreshold: parsedAlertThreshold } : {}),
		});
		handleOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-1">
					New Item
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Item</DialogTitle>
					<DialogDescription>Add a new inventory item to track stock.</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto px-1">
					{/* ITEM INFORMATION SECTION */}
					<div className="space-y-4">
						<div className="border-b pb-2">
							<h4 className="text-sm font-semibold text-slate-800">Item Information</h4>
						</div>
						<div className="space-y-2">
							<Label htmlFor="item-name">
								Name <span className="text-red-500">*</span>
							</Label>
							<Input id="item-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
						</div>
						<div className="grid grid-cols-2 gap-4">
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

					{/* INITIAL STOCK SECTION */}
					<div className="space-y-4">
						<div className="border-b pb-2 flex flex-col">
							<h4 className="text-sm font-semibold text-slate-800">Initial Stock (Optional)</h4>
							<p className="text-xs text-slate-500">Provide an initial stock reference</p>
						</div>
						<div className="space-y-2">
							<Label htmlFor="item-ref-code">Ref Code</Label>
							<Input
								id="item-ref-code"
								value={refCode}
								onChange={(e) => setRefCode(e.target.value)}
								placeholder="e.g. initial-stock-001"
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="item-qty">Qty On Hand</Label>
								<Input
									id="item-qty"
									type="number"
									min={0}
									value={quantityOnHand}
									onChange={(e) => setQuantityOnHand(e.target.value)}
									disabled={!refCode.trim()}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="item-expense">Expense</Label>
								<Input
									id="item-expense"
									type="number"
									min={0}
									value={expense}
									onChange={(e) => setExpense(e.target.value)}
									placeholder="0.00"
									disabled={!refCode.trim()}
								/>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
						{isPending ? "Creating..." : "Create Item"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
