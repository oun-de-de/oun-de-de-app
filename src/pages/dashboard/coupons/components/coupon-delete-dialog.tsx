import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import couponService from "@/core/api/services/coupon-service";
import type { Coupon } from "@/core/types/coupon";
import { Button } from "@/core/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/ui/dialog";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { toUtcIsoStartOfDay } from "@/core/utils/date-utils";

type CouponDeleteDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	coupon: Coupon | null;
};

function toDateInputValue(value: string | null | undefined): string {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function CouponDeleteDialog({ open, onOpenChange, coupon }: CouponDeleteDialogProps) {
	const queryClient = useQueryClient();
	const [delAccNo, setDelAccNo] = useState("");
	const [delDate, setDelDate] = useState("");

	useEffect(() => {
		setDelAccNo(coupon?.delAccNo ?? "");
		setDelDate(toDateInputValue(coupon?.delDate));
	}, [coupon]);

	const { mutateAsync: deleteCoupon, isPending } = useMutation({
		mutationFn: async () => {
			if (!coupon?.couponNo) throw new Error("Coupon number is required to delete a coupon");
			return couponService.deleteCouponByCouponNo(coupon.couponNo, {
				delAccNo: delAccNo || undefined,
				delDate: toUtcIsoStartOfDay(delDate),
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["coupons"] });
			toast.success("Coupon deleted successfully");
			onOpenChange(false);
		},
		onError: () => {
			toast.error("Failed to delete coupon");
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Coupon</DialogTitle>
					<DialogDescription>
						Mark coupon {coupon?.couponNo ?? "-"} as deleted. Accounting number and date are optional.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="coupon-delete-acc-no">Delete Accounting No</Label>
						<Input
							id="coupon-delete-acc-no"
							value={delAccNo}
							onChange={(event) => setDelAccNo(event.target.value)}
							placeholder="Optional accounting reference"
						/>
					</div>
					<div className="space-y-1.5">
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
					<Button variant="destructive" onClick={() => deleteCoupon()} disabled={isPending || !coupon?.couponNo}>
						{isPending ? "Deleting..." : "Delete Coupon"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
