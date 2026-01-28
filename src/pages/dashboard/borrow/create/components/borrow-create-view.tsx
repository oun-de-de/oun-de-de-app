import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, ShoppingCart, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { SmartDataTable } from "@/core/components/common/smart-data-table";
import { cn } from "@/core/utils";
import { useBorrowCartStore, useCartTotal } from "@/pages/dashboard/borrow/stores/borrowCartStore";

type Equipment = {
	id: string;
	code: string;
	name: string;
	category: string;
	inStock: number;
	price: number;
};

const MOCK_EQUIPMENT: Equipment[] = [
	{ id: "e1", code: "EQ-001", name: "Drill Machine X200", category: "Power Tools", inStock: 5, price: 50 },
	{ id: "e2", code: "EQ-002", name: "Hammer Heavy Duty", category: "Hand Tools", inStock: 12, price: 10 },
	{ id: "e3", code: "EQ-003", name: "Ladder 10ft", category: "General", inStock: 3, price: 25 },
	{ id: "e4", code: "EQ-004", name: "Safety Helmet", category: "Safety", inStock: 20, price: 5 },
	{ id: "e5", code: "EQ-005", name: "Cordless Screwdriver", category: "Power Tools", inStock: 8, price: 35 },
];

export function BorrowCreateView() {
	const navigate = useNavigate();
	const [searchText, setSearchText] = useState("");

	const cart = useBorrowCartStore((state) => state.cart);
	const addToCart = useBorrowCartStore((state) => state.addToCart);
	const removeFromCart = useBorrowCartStore((state) => state.removeFromCart);
	const updateQty = useBorrowCartStore((state) => state.updateQty);
	const totalAmount = useCartTotal();

	const columns = useMemo<ColumnDef<Equipment>[]>(
		() => [
			{ accessorKey: "code", header: "Code" },
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ getValue }) => <span className="font-medium">{getValue() as string}</span>,
			},
			{ accessorKey: "category", header: "Category" },
			{
				accessorKey: "inStock",
				header: "Stock",
				cell: ({ getValue }) => <span className="text-gray-600">{getValue() as number} Available</span>,
			},
			{
				id: "actions",
				header: "Action",
				cell: ({ row }) => (
					<button
						type="button"
						onClick={() => addToCart(row.original)}
						className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition"
					>
						Add
					</button>
				),
			},
		],
		[addToCart],
	);

	const filteredData = useMemo(() => {
		if (!searchText) return MOCK_EQUIPMENT;
		const q = searchText.toLowerCase();
		return MOCK_EQUIPMENT.filter((e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q));
	}, [searchText]);

	const handleProceed = () => {
		if (cart.length === 0) return;
		navigate("../payment");
	};

	return (
		<div className="flex h-full gap-4 p-4 overflow-hidden">
			{/* Left: Equipment List */}
			<div className="flex-1 flex flex-col min-w-0 bg-white rounded-lg shadow h-full">
				<div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
					<h2 className="text-lg font-semibold text-gray-800">Select Equipment</h2>
					<input
						type="text"
						placeholder="Search equipment..."
						className="px-3 py-1.5 border rounded text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</div>
				<div className="flex-1 overflow-auto p-4">
					<SmartDataTable
						data={filteredData}
						columns={columns}
						className="h-full"
						paginationConfig={{
							page: 1,
							pageSize: 10,
							totalItems: filteredData.length,
							totalPages: 1,
							onPageChange: () => {},
							onPageSizeChange: () => {},
							paginationItems: [1],
						}}
					/>
				</div>
			</div>

			{/* Right: Cart Summary */}
			<div className="w-96 bg-white rounded-lg shadow flex flex-col h-full border-l border-gray-100">
				<div className="p-4 border-b bg-gray-50 rounded-t-lg flex items-center gap-2">
					<ShoppingCart className="w-5 h-5 text-gray-600" />
					<h2 className="text-lg font-semibold text-gray-800">Selected Items ({cart.length})</h2>
				</div>

				<div className="flex-1 overflow-y-auto p-4 space-y-3">
					{cart.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-gray-400">
							<ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
							<p>No items selected</p>
						</div>
					) : (
						cart.map((item) => (
							<div key={item.id} className="flex flex-col bg-gray-50 p-3 rounded-md border border-gray-100">
								<div className="flex justify-between items-start mb-2">
									<div>
										<div className="font-medium text-gray-800">{item.name}</div>
										<div className="text-xs text-gray-500">{item.code}</div>
									</div>
									<button
										type="button"
										onClick={() => removeFromCart(item.id)}
										className="text-gray-400 hover:text-red-500"
									>
										<X className="w-4 h-4" />
									</button>
								</div>
								<div className="flex items-center justify-between mt-2">
									<div className="flex items-center border bg-white rounded">
										<button
											type="button"
											className="px-2 py-1 hover:bg-gray-100 text-gray-600"
											onClick={() => updateQty(item.id, -1)}
										>
											-
										</button>
										<span className="px-2 text-sm font-medium w-8 text-center">{item.qty}</span>
										<button
											type="button"
											className="px-2 py-1 hover:bg-gray-100 text-gray-600"
											onClick={() => updateQty(item.id, 1)}
										>
											+
										</button>
									</div>
									<div className="font-medium text-gray-700">${(item.price * item.qty).toFixed(2)}</div>
								</div>
							</div>
						))
					)}
				</div>

				<div className="p-4 border-t bg-gray-50 rounded-b-lg">
					<div className="flex justify-between items-center mb-4">
						<span className="text-gray-600">Total Amount</span>
						<span className="text-xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
					</div>
					<button
						type="button"
						disabled={cart.length === 0}
						onClick={handleProceed}
						className={cn(
							"w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all",
							cart.length === 0
								? "bg-gray-300 text-gray-500 cursor-not-allowed"
								: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl",
						)}
					>
						Proceed to Checkout <ArrowRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
