import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

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

const createItemSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	type: z.enum(["consumable", "equipment"]),
	unitId: z.string().optional(),
	supplierId: z.string().optional(),
	unitPrice: z.coerce.number().min(0, "Unit price must be 0 or greater"),
	alertThreshold: z.coerce.number().min(0),
	refCode: z.string().optional(),
	quantityOnHand: z.coerce.number().min(0),
	expense: z.coerce.number().optional(),
});

type CreateItemFormValues = z.infer<typeof createItemSchema>;

type CreateItemDialogProps = {
	onSubmit: (data: CreateInventoryItem) => void;
	isPending?: boolean;
};

export function CreateItemDialog({ onSubmit, isPending }: CreateItemDialogProps) {
	const [open, setOpen] = useState(false);
	const { data: units } = useGetUnitList();
	const { data: suppliers } = useGetSupplierList();

	const form = useForm<CreateItemFormValues>({
		resolver: zodResolver(createItemSchema),
		defaultValues: {
			name: "",
			type: "consumable",
			unitId: "",
			supplierId: "",
			unitPrice: 0,
			alertThreshold: 0,
			refCode: "",
			quantityOnHand: 0,
			expense: undefined,
		},
	});

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = form;

	const type = watch("type");
	const unitId = watch("unitId");
	const supplierId = watch("supplierId");
	const refCode = watch("refCode");

	const handleOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			reset();
		}
		setOpen(nextOpen);
	};

	const onFormSubmit: SubmitHandler<CreateItemFormValues> = (values) => {
		const normalizedRefCode = values.refCode?.trim();

		onSubmit({
			name: values.name.trim(),
			type: values.type,
			unitPrice: values.unitPrice,
			...(values.unitId && values.unitId !== SELECT_NONE_VALUE ? { unitId: values.unitId } : {}),
			...(values.supplierId && values.supplierId !== SELECT_NONE_VALUE ? { supplierId: values.supplierId } : {}),
			...(normalizedRefCode
				? {
						initStock: {
							refCode: normalizedRefCode,
							quantityOnHand: values.quantityOnHand,
							...(values.expense && values.expense > 0 ? { expense: values.expense } : {}),
						},
					}
				: {}),
			alertThreshold: values.alertThreshold,
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
								<Input id="item-threshold" autoComplete="off" type="number" min={0} {...register("alertThreshold")} />
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
						<div className="grid grid-cols-2 gap-4">
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
							<div className="space-y-2">
								<Label htmlFor="item-expense">Expense</Label>
								<Input
									id="item-expense"
									autoComplete="off"
									type="number"
									min={0}
									{...register("expense")}
									placeholder="0.00"
									disabled={!refCode?.trim()}
								/>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit(onFormSubmit)} disabled={isPending}>
						{isPending ? "Creating..." : "Create Item"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
