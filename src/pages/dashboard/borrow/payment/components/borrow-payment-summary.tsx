import type { CartItem } from "@/pages/dashboard/borrow/stores/borrow-cart-store";

interface BorrowPaymentSummaryProps {
	cart: CartItem[];
	totalAmount: number;
}

export function BorrowPaymentSummary({ cart, totalAmount }: BorrowPaymentSummaryProps) {
	return (
		<div className="px-6 py-4 bg-gray-50 border-t mt-auto">
			<div className="flex items-center gap-2 mb-2 text-gray-400">
				<h3 className="text-[10px] font-bold uppercase tracking-wider">Summary Account</h3>
			</div>
			<div className="flex gap-8 text-sm">
				<div className="flex items-center gap-2">
					<span className="text-gray-500 font-medium text-xs uppercase">Items:</span>
					<span className="font-bold text-gray-800">{cart.length}</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-gray-500 font-medium text-xs uppercase">Quantity:</span>
					<span className="font-bold text-gray-800">{cart.reduce((a, b) => a + b.qty, 0)}</span>
				</div>
				<div className="flex items-center gap-2 ml-auto">
					<span className="text-gray-500 font-medium text-xs uppercase">Net Amount:</span>
					<span className="font-bold text-gray-800">${totalAmount.toFixed(2)}</span>
				</div>
			</div>
		</div>
	);
}
