import { RefreshCw } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import type { SaleCategory } from "@/core/domain/sales/entities/sale-category";
import type { InventoryItem } from "@/core/types/inventory";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/core/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import { Switch } from "@/core/ui/switch";
import { cn } from "@/core/utils";
import { ChoiceChips } from "@/pages/sale/new/components/filters";
import type { UpdateStockFormValues } from "../hooks/use-equipment-stock-form";

type UpdateStockDialogProps = {
	item: InventoryItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	form: UseFormReturn<UpdateStockFormValues>;
	onRegenerateRefCode: () => void;
	onSubmit: (values: UpdateStockFormValues) => Promise<unknown>;
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
	form,
	onRegenerateRefCode,
	onSubmit,
	isPending = false,
}: UpdateStockDialogProps) {
	const refCodeMode = form.watch("refCodeMode");
	const currentReason = form.watch("reason");

	return (
		<Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-1">
					Update Stock
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Update Stock</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form id="update-stock-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
						<div className="space-y-1.5">
							<FormLabel>Item</FormLabel>
							<Input
								value={`${item.name} (${item.code})`}
								disabled
								className="h-11 border-slate-200 rounded-lg bg-slate-50/50 cursor-not-allowed opacity-80"
							/>
						</div>

						<FormField
							control={form.control}
							name="refCode"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<div className="flex items-center justify-between">
										<FormLabel>
											Ref Code <span className="text-red-500">*</span>
										</FormLabel>
										<FormField
											control={form.control}
											name="refCodeMode"
											render={({ field: modeField }) => (
												<div className="flex items-center gap-2">
													<span
														className={cn(
															"text-xs",
															modeField.value === "auto" ? "text-slate-400" : "font-medium text-slate-600",
														)}
													>
														Manual
													</span>
													<Switch
														checked={modeField.value === "auto"}
														onCheckedChange={(checked) => modeField.onChange(checked ? "auto" : "manual")}
													/>
													<span
														className={cn(
															"text-xs",
															modeField.value === "auto" ? "font-medium text-blue-600" : "text-slate-400",
														)}
													>
														Auto
													</span>
												</div>
											)}
										/>
									</div>
									<FormControl>
										<div className="relative">
											<Input
												{...field}
												placeholder={refCodeMode === "auto" ? "Auto-generated" : "e.g. PUR-001"}
												className={cn(
													"h-11 border-slate-200 rounded-lg bg-slate-50/50",
													refCodeMode === "auto" && "pr-10",
												)}
											/>
											{refCodeMode === "auto" && (
												<button
													type="button"
													onClick={onRegenerateRefCode}
													className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
													title="Regenerate code"
												>
													<RefreshCw className="h-3.5 w-3.5" />
												</button>
											)}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="reason"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel>Reason</FormLabel>
									<FormControl>
										<div className="grid gap-2">
											<ChoiceChips
												options={CHOICE_CHIPS_OPTIONS}
												value={CHOICE_CHIPS_OPTIONS.filter((option) => option.name === field.value)}
												onChange={(next) => field.onChange(next[0]?.name ?? field.value)}
												selectionMode="single"
												renderLabel={(option) => {
													const matched = REASON_OPTIONS.find((item) => item.value === option.name);
													return matched?.label ?? option.name;
												}}
												inactiveClassName="rounded-md border border-slate-300 bg-white !p-2 !text-xs font-medium text-slate-700 hover:bg-slate-100"
												getChipClassName={(option, isActive) => {
													if (!isActive) return undefined;
													const variant = getReasonVariant(option.name);
													return cn(
														"rounded-md border-none !p-2 !text-xs text-white",
														variant === "info" && "bg-gradient-to-r from-info to-info/80",
														variant === "warning" && "bg-gradient-to-r from-warning to-warning/80",
														variant === "destructive" && "bg-gradient-to-r from-destructive to-destructive/80",
														variant === "default" && "bg-gradient-to-r from-primary to-primary/80",
													);
												}}
											/>
											<p className="text-xs text-slate-500">
												{REASON_OPTIONS.find((option) => option.value === currentReason)?.description ??
													"Select a reason for this stock update"}
											</p>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="quantity"
								render={({ field }) => (
									<FormItem className="space-y-1.5">
										<FormLabel>Quantity</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={1}
												{...field}
												className="h-11 border-slate-200 rounded-lg bg-slate-50/50"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="expense"
								render={({ field }) => (
									<FormItem className="space-y-1.5">
										<FormLabel>Expense (៛)</FormLabel>
										<FormControl>
											<div className="relative">
												<span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
													៛
												</span>
												<Input
													type="number"
													min={0}
													placeholder="0"
													className="h-11 pl-7 border-slate-200 rounded-lg bg-slate-50/50"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="memo"
							render={({ field }) => (
								<FormItem className="space-y-1.5">
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="Describe this stock update"
											className="h-11 border-slate-200 rounded-lg bg-slate-50/50"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>

				<DialogFooter>
					<Button type="submit" form="update-stock-form" disabled={isPending}>
						{isPending ? "Saving..." : "Update Stock"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
