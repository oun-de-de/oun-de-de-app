import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { InvoiceType } from "@/core/types/invoice";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";
import { useUpdateInvoices } from "../hooks/use-update-invoices";

interface InvoiceBulkUpdateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedIds: string[];
	onSuccess?: () => void;
}

export function InvoiceBulkUpdateDialog({ open, onOpenChange, selectedIds, onSuccess }: InvoiceBulkUpdateDialogProps) {
	const updateMutation = useUpdateInvoices();

	// Form State
	const [customerName, setCustomerName] = useState("");
	const [type, setType] = useState<InvoiceType | "">("");

	useEffect(() => {
		if (open) {
			setCustomerName("");
			setType("");
		}
	}, [open]);

	const handleSubmit = () => {
		if (!type && !customerName.trim()) {
			toast.error("Please provide a Customer Name or select a Type to apply.");
			return;
		}

		updateMutation.mutate(
			{
				invoiceIds: selectedIds,
				customerName: customerName.trim(),
				type: type as InvoiceType,
			},
			{
				onSuccess: () => {
					toast.success(`Successfully updated ${selectedIds.length} invoice(s).`);
					onOpenChange(false);
					onSuccess?.();
				},
				onError: (err) => {
					toast.error("Failed to update invoices. Please try again.");
					console.error("Bulk update error:", err);
				},
			},
		);
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
						<Select value={type} onValueChange={(v) => setType(v as InvoiceType)} disabled={isUpdating}>
							<SelectTrigger>
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="INVOICE">Invoice</SelectItem>
								<SelectItem value="RECEIPT">Receipt</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isUpdating || (!type && !customerName.trim())}>
						{isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Update {selectedIds.length} items
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
