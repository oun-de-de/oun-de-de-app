import { useMemo } from "react";
import { SmartDataTable } from "@/core/components/common/smart-data-table";
import type { CartItem } from "@/pages/dashboard/borrow/stores/borrow-cart-store";
import { getBorrowPaymentColumns } from "./borrow-payment-columns";

interface BorrowPaymentItemsProps {
	cart: CartItem[];
	onRemove: (id: string) => void;
}

export function BorrowPaymentItems({ cart, onRemove }: BorrowPaymentItemsProps) {
	const columns = useMemo(() => getBorrowPaymentColumns(onRemove), [onRemove]);

	return (
		<div className="flex-1 min-h-0 bg-white border border-slate-200 shadow-sm rounded-lg flex flex-col overflow-hidden">
			<SmartDataTable data={cart} columns={columns} className="flex-1 min-h-0" maxBodyHeight="100%" />
		</div>
	);
}
