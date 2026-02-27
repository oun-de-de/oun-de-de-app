import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InvoiceType } from "@/core/types/invoice";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { type UpdateInvoicesPayload, useUpdateInvoices } from "../hooks/use-update-invoices";
import { isInvoiceType } from "../utils/formatters";

interface InvoiceBulkUpdateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedIds: string[];
	initialCustomerName?: string;
	initialType?: string;
	onSuccess?: () => void;
}

const EMPTY_TYPE = "";

const buildUpdatePayload = ({
	invoiceIds,
	customerName,
	type,
}: {
	invoiceIds: string[];
	customerName: string;
	type: InvoiceType | "";
}): UpdateInvoicesPayload | null => {
	const trimmedCustomerName = customerName.trim();
	const normalizedType = type === EMPTY_TYPE ? undefined : type;

	if (!trimmedCustomerName && !normalizedType) {
		return null;
	}

	return {
		invoiceIds,
		...(trimmedCustomerName ? { customerName: trimmedCustomerName } : {}),
		...(normalizedType ? { type: normalizedType } : {}),
	};
};

export function InvoiceBulkUpdateDialog({
	open,
	onOpenChange,
	selectedIds,
	initialCustomerName,
	initialType,
	onSuccess,
}: InvoiceBulkUpdateDialogProps) {
	const updateMutation = useUpdateInvoices();

	// Form State
	const [customerName, setCustomerName] = useState("");
	const [type, setType] = useState<InvoiceType | "">(EMPTY_TYPE);

	useEffect(() => {
		if (open) {
			setCustomerName(initialCustomerName ?? "");
			setType(initialType && isInvoiceType(initialType) ? initialType : EMPTY_TYPE);
		}
	}, [open, initialCustomerName, initialType]);

	const canSubmit = Boolean(customerName.trim()) || type !== EMPTY_TYPE;
	const handleTypeChange = (value: string) => {
		setType(isInvoiceType(value) ? value : EMPTY_TYPE);
	};

	const handleSubmit = () => {
		const payload = buildUpdatePayload({
			invoiceIds: selectedIds,
			customerName,
			type,
		});

		if (!payload) {
			toast.error("Please provide a Customer Name or select a Type to apply.");
			return;
		}

		updateMutation.mutate(payload, {
			onSuccess: () => {
				toast.success(`Successfully updated ${selectedIds.length} invoice(s).`);
				onOpenChange(false);
				onSuccess?.();
			},
			onError: (err) => {
				toast.error("Failed to update invoices. Please try again.");
				console.error("Bulk update error:", err);
			},
		});
	};

	const isUpdating = updateMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={isUpdating ? undefined : onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Update Selected Invoices</DialogTitle>
					<DialogDescription>
						Apply new values to the {selectedIds.length} selected invoice(s). At least one field is required.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="customerName">Customer Name (Optional)</Label>
						<Input
							id="customerName"
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder="Leave blank to keep existing"
							disabled={isUpdating}
						/>
					</div>
					<div className="grid gap-2">
						<Label>Type</Label>
						<Select value={type} onValueChange={handleTypeChange} disabled={isUpdating}>
							<SelectTrigger>
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="invoice">Invoice</SelectItem>
								<SelectItem value="receipt">Receipt</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isUpdating || !canSubmit}>
						{isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Update {selectedIds.length} items
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
