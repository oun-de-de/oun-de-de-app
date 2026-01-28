import { ArrowLeft, Check, CreditCard } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useBorrowCartStore, useCartTotal } from "@/pages/dashboard/borrow/stores/borrowCartStore";

export function BorrowPaymentView() {
	const navigate = useNavigate();
	const cart = useBorrowCartStore((state) => state.cart);
	const clearCart = useBorrowCartStore((state) => state.clearCart);
	const totalAmount = useCartTotal();
	const [paymentMethod, setPaymentMethod] = useState("cash");

	if (cart.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full space-y-4">
				<p className="text-gray-500">No items to pay for.</p>
				<button type="button" onClick={() => navigate("../new")} className="text-blue-600 hover:underline">
					Go back to selection
				</button>
			</div>
		);
	}

	const handleConfirm = () => {
		// Mock API call
		toast.success("Borrowing request submitted successfully!");
		clearCart();
		navigate("/dashboard/borrow");
	};

	return (
		<div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-6">
			<button
				type="button"
				className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-gray-900 w-fit"
				onClick={() => navigate(-1)}
			>
				<ArrowLeft className="w-4 h-4" />
				<span>Back</span>
			</button>

			<h1 className="text-2xl font-bold text-gray-900">Checkout & Payment</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Order Summary */}
				<div className="bg-white p-6 rounded-lg shadow space-y-4">
					<h2 className="text-lg font-semibold border-b pb-2">Order Summary</h2>
					<div className="space-y-3">
						{cart.map((item) => (
							<div key={item.id} className="flex justify-between items-center text-sm">
								<div>
									<div className="font-medium text-gray-800">{item.name}</div>
									<div className="text-gray-500">Qty: {item.qty}</div>
								</div>
								<div className="font-medium">${(item.price * item.qty).toFixed(2)}</div>
							</div>
						))}
					</div>
					<div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
						<span>Total</span>
						<span className="text-blue-600">${totalAmount.toFixed(2)}</span>
					</div>
				</div>

				{/* Payment Details */}
				<div className="bg-white p-6 rounded-lg shadow space-y-6">
					<h2 className="text-lg font-semibold border-b pb-2">Payment Details</h2>

					<div className="space-y-4">
						<div>
							<label htmlFor="borrowerName" className="block text-sm font-medium text-gray-700 mb-1">
								Borrower Name
							</label>
							<input
								id="borrowerName"
								type="text"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter borrower name"
							/>
						</div>

						<div>
							<span className="block text-sm font-medium text-gray-700 mb-1">Payment Method</span>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									className={`px-4 py-3 border rounded-md flex items-center justify-center gap-2 ${
										paymentMethod === "cash"
											? "border-blue-500 bg-blue-50 text-blue-700"
											: "border-gray-200 hover:bg-gray-50"
									}`}
									onClick={() => setPaymentMethod("cash")}
								>
									<span className="font-medium">Cash</span>
								</button>
								<button
									type="button"
									className={`px-4 py-3 border rounded-md flex items-center justify-center gap-2 ${
										paymentMethod === "card"
											? "border-blue-500 bg-blue-50 text-blue-700"
											: "border-gray-200 hover:bg-gray-50"
									}`}
									onClick={() => setPaymentMethod("card")}
								>
									<CreditCard className="w-4 h-4" />
									<span className="font-medium">Card</span>
								</button>
							</div>
						</div>

						<div>
							<label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
								Notes (Optional)
							</label>
							<textarea
								id="notes"
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
								placeholder="Add any notes here..."
							/>
						</div>
					</div>

					<button
						type="button"
						onClick={handleConfirm}
						className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow flex items-center justify-center gap-2 mt-4"
					>
						<Check className="w-5 h-5" /> Confirm Payment & Borrow
					</button>
				</div>
			</div>
		</div>
	);
}
