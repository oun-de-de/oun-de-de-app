import { useEffect, useState } from "react";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/select";

interface InvoiceBatchUpdateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdate: (data: { customerName?: string; status?: string }) => void;
	isUpdating?: boolean;
	selectedCount: number;
}

const toOptional = (value: string) => {
	const normalized = value.trim();
	return normalized || undefined;
};

export function InvoiceBatchUpdateDialog({
	open,
	onOpenChange,
	onUpdate,
	isUpdating,
	selectedCount,
}: InvoiceBatchUpdateDialogProps) {
	const [customerName, setCustomerName] = useState("");
	const [status, setStatus] = useState("");

	useEffect(() => {
		if (open) {
			setCustomerName("");
			setStatus("");
		}
	}, [open]);

	const canSubmit = Boolean(customerName.trim()) || Boolean(status.trim());

	const handleUpdate = () => {
		const normalizedCustomerName = toOptional(customerName);
		const normalizedStatus = toOptional(status);
		const payload = {
			...(normalizedCustomerName ? { customerName: normalizedCustomerName } : {}),
			...(normalizedStatus ? { status: normalizedStatus } : {}),
		};
		if (!normalizedCustomerName && !normalizedStatus) return;
		onUpdate(payload);
	};

	return (
		<Dialog open={open} onOpenChange={isUpdating ? undefined : onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Update {selectedCount} Invoice(s)</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="customerName" className="text-right">
							Customer
						</Label>
						<Input
							id="customerName"
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							className="col-span-3"
							placeholder="Leave empty to keep current"
						/>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="status" className="text-right">
							Status
						</Label>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger className="col-span-3">
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value=" ">Keep current</SelectItem>
								<SelectItem value="open">Open</SelectItem>
								<SelectItem value="closed">Closed</SelectItem>
								<SelectItem value="overdue">Overdue</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
						Cancel
					</Button>
					<Button onClick={handleUpdate} disabled={isUpdating || !canSubmit}>
						{isUpdating ? "Updating..." : "Update"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
