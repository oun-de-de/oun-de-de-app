import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { type UpdateInvoicesPayload, useUpdateInvoices } from "../hooks/use-update-invoices";

interface InvoiceBulkUpdateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedIds: string[];
	initialCustomerName?: string;
	onSuccess?: () => void;
}

const buildUpdatePayload = ({
	invoiceIds,
	customerName,
	initialCustomerName,
}: {
	invoiceIds: string[];
	customerName: string;
	initialCustomerName?: string;
}): UpdateInvoicesPayload | null => {
	const trimmedCustomerName = customerName.trim();
	const trimmedInitialCustomerName = initialCustomerName?.trim() ?? "";
	const hasCustomerNameChanged = trimmedCustomerName !== trimmedInitialCustomerName;

	if (!hasCustomerNameChanged) {
		return null;
	}

	return {
		invoiceIds,
		...(hasCustomerNameChanged ? { customerName: trimmedCustomerName } : {}),
	};
};

export function InvoiceBulkUpdateDialog({
	open,
	onOpenChange,
	selectedIds,
	initialCustomerName,
	onSuccess,
}: InvoiceBulkUpdateDialogProps) {
	const updateMutation = useUpdateInvoices();

	// Form State
	const [customerName, setCustomerName] = useState("");

	useEffect(() => {
		if (open) {
			setCustomerName(initialCustomerName ?? "");
		}
	}, [open, initialCustomerName]);

	const hasCustomerNameChanged = customerName.trim() !== (initialCustomerName?.trim() ?? "");
	const canSubmit = hasCustomerNameChanged;

	const handleSubmit = () => {
		const payload = buildUpdatePayload({
			invoiceIds: selectedIds,
			customerName,
			initialCustomerName,
		});

		if (!payload) {
			toast.error("Please change at least one field before updating.");
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
						<Label htmlFor="customerName">Customer Name</Label>
						<Input
							id="customerName"
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder="Leave blank to clear"
							disabled={isUpdating}
						/>
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
