import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import couponService from "@/core/api/services/coupon-service";
import { useDialogSubmitHandler } from "@/core/hooks/use-dialog-submit-handler";
import type { Coupon } from "@/core/types/coupon";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { formatDateStartLocalApiValueFromInput } from "@/pages/dashboard/accounting/utils/format-local-date-time";

type CouponDeleteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	coupon: Coupon | null;
};

function toDateInputValue(value: string | null | undefined): string {
	if (!value) return "";
	const directDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/);
	if (directDateMatch) return directDateMatch[1];
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function CouponDeleteDialog({ open, onOpenChange, coupon }: CouponDeleteDialogProps) {
	const queryClient = useQueryClient();
	const [delAccNo, setDelAccNo] = useState("");
	const [delDate, setDelDate] = useState("");
	const submitAndClose = useDialogSubmitHandler({
		closeDialog: () => onOpenChange(false),
	});

	useEffect(() => {
		setDelAccNo(coupon?.delAccNo ?? "");
		setDelDate(toDateInputValue(coupon?.delDate));
	}, [coupon]);

	const { mutateAsync: deleteCoupon, isPending } = useMutation({
		mutationFn: async () => {
			if (!coupon?.couponNo) throw new Error("Coupon number is required to delete a coupon");
			const serializedDeleteDate = delDate ? formatDateStartLocalApiValueFromInput(delDate) : undefined;
			if (delDate && !serializedDeleteDate) {
				throw new Error("Delete date is invalid");
			}
			return couponService.deleteCouponByCouponNo(coupon.couponNo, {
				delAccNo: delAccNo || undefined,
				delDate: serializedDeleteDate,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["coupons"] });
			toast.success("Coupon deleted successfully");
		},
		onError: (error) => {
			const message = error instanceof Error ? error.message : "Failed to delete coupon";
			toast.error(message);
		},
	});

	return (
		<Dialog open={open} onOpenChange={isPending ? undefined : onOpenChange}>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Delete Coupon</DialogTitle>
					<DialogDescription>
						Mark coupon {coupon?.couponNo ?? "-"} as deleted. Accounting number and date are optional.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-2 md:py-3">
					<div className="grid gap-2">
						<Label htmlFor="coupon-delete-acc-no">Delete Accounting No</Label>
						<Input
							id="coupon-delete-acc-no"
							value={delAccNo}
							onChange={(event) => setDelAccNo(event.target.value)}
							placeholder="Optional accounting reference"
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="coupon-delete-date">Delete Date</Label>
						<Input
							id="coupon-delete-date"
							type="date"
							value={delDate}
							onChange={(event) => setDelDate(event.target.value)}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						className="text-white"
						onClick={() => submitAndClose(() => deleteCoupon())}
						disabled={isPending || !coupon?.couponNo}
					>
						{isPending ? "Deleting..." : "Delete Coupon"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
