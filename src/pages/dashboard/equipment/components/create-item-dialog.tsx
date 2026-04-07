import type { CreateInventoryItem, CreateInventoryItemType } from "@/core/types/inventory";
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
import { useGetSupplierList, useGetUnitList } from "../../settings/hooks/use-settings";
import { SELECT_NONE_VALUE } from "@/core/constants/form";
import { useDialogOpenState } from "@/core/hooks/use-dialog-open-state";
import { useDialogSubmitHandler } from "@/core/hooks/use-dialog-submit-handler";
import { useCreateItemForm } from "../hooks/use-create-item-form";

type CreateItemDialogProps = {
	onSubmit: (data: CreateInventoryItem) => Promise<unknown>;
	isPending?: boolean;
};

export function CreateItemDialog({ onSubmit, isPending }: CreateItemDialogProps) {
	const { data: units } = useGetUnitList();
	const { data: suppliers } = useGetSupplierList();
	const { form, submit, reset: resetForm } = useCreateItemForm({ onSubmit });

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = form;

	const type = watch("type");
	const unitId = watch("unitId");
	const supplierId = watch("supplierId");
	const refCode = watch("refCode");

	const dialog = useDialogOpenState({
		isDismissDisabled: isPending,
		onClose: resetForm,
	});
	const submitAndClose = useDialogSubmitHandler({
		closeDialog: dialog.close,
	});

	return (
		<Dialog open={dialog.open} onOpenChange={dialog.onOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-1">
					New Item
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[540px] md:max-w-2xl">
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
							<Input
								id="item-name"
								autoComplete="off"
								{...register("name")}
								placeholder="Item name"
								aria-invalid={!!errors.name}
							/>
							{errors.name ? <p className="text-xs text-red-500">{errors.name.message}</p> : null}
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="item-type">Type</Label>
								<Select
									value={type}
									onValueChange={(v) => setValue("type", v as CreateInventoryItemType, { shouldValidate: true })}
								>
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
								<Select value={unitId} onValueChange={(v) => setValue("unitId", v, { shouldValidate: true })}>
									<SelectTrigger id="item-unit-id" className="w-full">
										<SelectValue placeholder="Select unit" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={SELECT_NONE_VALUE}>None</SelectItem>
										{units?.map((unit) => (
											<SelectItem key={unit.id} value={unit.id}>
												{unit.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="item-unit-price">
									Unit Price (៛) <span className="text-red-500">*</span>
								</Label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">
										៛
									</span>
									<Input
										id="item-unit-price"
										autoComplete="off"
										type="number"
										min={0}
										{...register("unitPrice")}
										placeholder="0"
										className="pl-7"
										aria-invalid={!!errors.unitPrice}
									/>
								</div>
								{errors.unitPrice ? <p className="text-xs text-red-500">{errors.unitPrice.message}</p> : null}
							</div>
							<div className="space-y-2">
								<Label htmlFor="item-threshold">Alert Threshold</Label>
								<Input
									id="item-threshold"
									autoComplete="off"
									type="number"
									min={0}
									step="1"
									placeholder="1"
									{...register("alertThreshold", {
										setValueAs: (value) => (value === "" ? undefined : Number(value)),
									})}
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="item-supplier">Supplier</Label>
							<Select value={supplierId} onValueChange={(v) => setValue("supplierId", v, { shouldValidate: true })}>
								<SelectTrigger id="item-supplier" className="w-full">
									<SelectValue placeholder="Select supplier (optional)" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={SELECT_NONE_VALUE}>None</SelectItem>
									{suppliers?.map((supplier) => (
										<SelectItem key={supplier.id} value={supplier.id}>
											{supplier.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
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
								autoComplete="off"
								{...register("refCode")}
								placeholder="e.g. initial-stock-001"
							/>
						</div>
						<div className="grid grid-cols-1 gap-4">
							<div className="space-y-2">
								<Label htmlFor="item-qty">Qty On Hand</Label>
								<Input
									id="item-qty"
									autoComplete="off"
									type="number"
									min={0}
									{...register("quantityOnHand")}
									disabled={!refCode?.trim()}
								/>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => dialog.onOpenChange(false)} disabled={isPending}>
						Cancel
					</Button>
					<Button onClick={handleSubmit((values) => submitAndClose(() => submit(values)))} disabled={isPending}>
						{isPending ? "Creating..." : "Create Item"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
