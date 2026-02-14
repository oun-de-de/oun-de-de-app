import { ShoppingCart } from "lucide-react";
import { useMemo } from "react";
import { SmartDataTable } from "@/core/components/common/smart-data-table";
import { SectionHeader } from "@/pages/dashboard/borrow/components/borrow-section-header";
import type { CartItem } from "@/pages/dashboard/borrow/stores/borrow-cart-store";
import { getBorrowPaymentColumns } from "./borrow-payment-columns";

interface BorrowPaymentItemsProps {
	cart: CartItem[];
	onRemove: (id: string) => void;
}

export function BorrowPaymentItems({ cart, onRemove }: BorrowPaymentItemsProps) {
	const columns = useMemo(() => getBorrowPaymentColumns(onRemove), [onRemove]);

	return (
		<div className="flex-1 flex flex-col min-h-0 px-6 pb-4">
			<SectionHeader icon={ShoppingCart} title="Review Items" />

			<div className="flex-1 border rounded-md overflow-hidden bg-white flex flex-col">
				<SmartDataTable data={cart} columns={columns} />
			</div>
		</div>
	);
}
