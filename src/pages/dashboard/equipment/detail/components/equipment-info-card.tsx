import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { InventoryItem, UpdateInventoryItem } from "@/core/types/inventory";
import type { Supplier, Unit } from "@/core/types/setting";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { Text } from "@/core/ui/typography";
import { cn } from "@/core/utils";
import { formatKHR } from "@/core/utils/formatters";
import { SELECT_NONE_VALUE } from "@/core/constants/form";

function StatItem({ label, primary, children }: { label: string; primary?: boolean; children: React.ReactNode }) {
	return (
		<div className="space-y-1.5 flex flex-col">
			<Text variant="caption" className="text-slate-500 text-sm">
				{label}
			</Text>
			{typeof children === "string" || typeof children === "number" ? (
				<Text variant="body1" className={primary ? "text-2xl font-bold" : "text-xl font-semibold"}>
					{children}
				</Text>
			) : (
				children
			)}
		</div>
	);
}

type EquipmentInfoCardProps = {
	item: InventoryItem;
	units: Unit[];
	suppliers: Supplier[];
	onUpdate?: (updatedItem: UpdateInventoryItem) => Promise<unknown>;
	isUpdating?: boolean;
};

function toEditableItemType(type: InventoryItem["type"]): "consumable" | "equipment" {
	return type.toLowerCase() as "consumable" | "equipment";
}

const equipmentInfoSchema = z.object({
	name: z.string().trim().min(1, "Item name is required"),
	type: z.enum(["consumable", "equipment"]),
	unitId: z.string().optional(),
	supplierId: z.string().optional(),
	unitPrice: z.coerce.number().min(0, "Unit price must be 0 or greater"),
	alertThreshold: z.coerce.number().min(0, "Alert threshold must be 0 or greater"),
});

type EquipmentInfoFormValues = z.infer<typeof equipmentInfoSchema>;

function getDefaultValues(item: InventoryItem): EquipmentInfoFormValues {
	return {
		name: item.name,
		type: toEditableItemType(item.type),
		unitId: item.unit?.id ?? "",
		supplierId: item.supplier?.id ?? "",
		unitPrice: item.unitPrice ?? 0,
		alertThreshold: item.alertThreshold ?? 0,
	};
}

export function EquipmentInfoCard({ item, units, suppliers, onUpdate, isUpdating = false }: EquipmentInfoCardProps) {
	const [isEditing, setIsEditing] = useState(false);
	const form = useForm<EquipmentInfoFormValues>({
		resolver: zodResolver(equipmentInfoSchema),
		defaultValues: getDefaultValues(item),
	});

	const isLowStock = item.quantityOnHand <= item.alertThreshold;

	useEffect(() => {
		form.reset(getDefaultValues(item));
	}, [item, form]);

	const handleSave = async (values: EquipmentInfoFormValues) => {
		if (onUpdate) {
			await onUpdate({
				name: values.name.trim(),
				type: values.type,
				unitId: values.unitId === SELECT_NONE_VALUE || !values.unitId ? undefined : values.unitId,
				supplierId: values.supplierId === SELECT_NONE_VALUE || !values.supplierId ? undefined : values.supplierId,
				unitPrice: values.unitPrice,
				alertThreshold: values.alertThreshold,
			});
		}
		setIsEditing(false);
	};

	const handleCancel = () => {
		form.reset(getDefaultValues(item));
		setIsEditing(false);
	};

	return (
		<div className="rounded-lg border bg-white p-6 shadow-sm">
			<div className="flex items-start justify-between mb-4 md:mb-6">
				<div className="flex-1">
					{isEditing ? (
						<Form {...form}>
							<form id="equipment-info-form" onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
								<div className="grid gap-4 md:grid-cols-2">
									<FormField
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Item Name</FormLabel>
												<FormControl>
													<Input id="item-name" className="mt-1 w-full" {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Type</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<FormControl>
														<SelectTrigger id="item-type">
															<SelectValue placeholder="Select type" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="consumable">Consumable</SelectItem>
														<SelectItem value="equipment">Equipment</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="unitId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Unit</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<FormControl>
														<SelectTrigger id="item-unit">
															<SelectValue placeholder="Select unit" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value={SELECT_NONE_VALUE}>None</SelectItem>
														{units.map((unit) => (
															<SelectItem key={unit.id} value={unit.id}>
																{unit.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="supplierId"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Supplier</FormLabel>
												<Select value={field.value} onValueChange={field.onChange}>
													<FormControl>
														<SelectTrigger id="item-supplier">
															<SelectValue placeholder="Select supplier" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value={SELECT_NONE_VALUE}>None</SelectItem>
														{suppliers.map((supplier) => (
															<SelectItem key={supplier.id} value={supplier.id}>
																{supplier.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<Text variant="caption" className="text-slate-500">
													Supplier can be changed here.
												</Text>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="unitPrice"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Unit Price</FormLabel>
												<FormControl>
													<Input id="item-unit-price" type="number" min={0} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="alertThreshold"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Alert Threshold</FormLabel>
												<FormControl>
													<Input id="item-alert-threshold" type="number" min={0} {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</form>
						</Form>
					) : (
						<div className="flex flex-col">
							<div className="flex flex-wrap items-center gap-3">
								<Text variant="body1" className="text-2xl font-bold">
									{item.name}
								</Text>
								<Badge variant={isLowStock ? "error" : "success"} className={cn("md:h-8", isEditing && "hidden")}>
									{isLowStock ? "Low Stock" : "Normal"}
								</Badge>
							</div>
							<Text variant="body2" className="text-slate-500 mt-1">
								{item.code} • <Badge variant={item.type === "EQUIPMENT" ? "success" : "info"}>{item.type}</Badge>
							</Text>
						</div>
					)}
				</div>
				<div className="flex items-center justify-center gap-2">
					{!isEditing && onUpdate && (
						<Button size="sm" variant="warning" onClick={() => setIsEditing(true)}>
							Edit
						</Button>
					)}
				</div>
			</div>

			{isEditing && (
				<div className="flex gap-2 mt-4 pt-4 border-t justify-end">
					<Button size="sm" type="submit" form="equipment-info-form" disabled={isUpdating}>
						{isUpdating ? "Saving..." : "Save"}
					</Button>
					<Button size="sm" variant="secondary" onClick={handleCancel} disabled={isUpdating}>
						Cancel
					</Button>
				</div>
			)}

			{!isEditing && (
				<div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t">
					<StatItem label="Quantity On Hand" primary>
						{item.quantityOnHand}
					</StatItem>
					<StatItem label="Alert Threshold">{item.alertThreshold}</StatItem>
					<StatItem label="Unit">{item.unit?.name ?? "-"}</StatItem>
					<StatItem label="Supplier">{item.supplier?.name ?? "-"}</StatItem>
					<StatItem label="Unit Price">{formatKHR(item.unitPrice)}</StatItem>
					<StatItem label="Status">
						<Badge variant="info" shape="square" className="text-sm">
							Active
						</Badge>
					</StatItem>
				</div>
			)}
		</div>
	);
}
