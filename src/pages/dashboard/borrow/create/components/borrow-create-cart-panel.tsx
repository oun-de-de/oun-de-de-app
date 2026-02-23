import { ClipboardList, Minus, Package, Plus, Settings, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/core/ui/button";
import { ScrollArea } from "@/core/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/tabs";
import {
	useBorrowCartActions,
	useBorrowCartSelector,
	useBorrowCartState,
} from "@/pages/dashboard/borrow/stores/borrow-cart-store";

export function BorrowCreateCartPanel() {
	const navigate = useNavigate();
	const { cart } = useBorrowCartState();
	const { removeFromCart, updateQty, clearCart } = useBorrowCartActions();

	const totalQty = useBorrowCartSelector((state) => state.cart.reduce((sum, item) => sum + item.qty, 0));

	const handleProceed = () => {
		if (cart.length === 0) return;
		navigate("/dashboard/borrow/payment");
	};

	return (
		<Tabs defaultValue="cart" className="flex flex-col h-full bg-white border-l border-gray-200">
			<TabsList className="w-full justify-start rounded-none border-b h-11 p-0 bg-transparent space-x-4 px-4">
				<TabsTrigger
					value="cart"
					className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent px-1 font-bold text-xs uppercase tracking-wide text-gray-500 gap-2"
				>
					<ClipboardList className="w-3.5 h-3.5" /> Selected Items ({cart.length})
				</TabsTrigger>
				<TabsTrigger
					value="info"
					className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-none bg-transparent px-1 font-bold text-xs uppercase tracking-wide text-gray-500 gap-2"
				>
					<Settings className="w-3.5 h-3.5" /> Options
				</TabsTrigger>
			</TabsList>

			<div className="flex-1 overflow-hidden bg-white flex flex-col">
				<TabsContent value="cart" className="flex-1 flex flex-col min-h-0 mt-0">
					{cart.length === 0 ? (
						<div className="flex-1 flex flex-col items-center justify-center text-gray-300">
							<Package className="w-10 h-10 mb-2 opacity-20" />
							<p className="text-[10px] font-bold uppercase tracking-wide">No Items Selected</p>
						</div>
					) : (
						<ScrollArea className="flex-1">
							<div className="divide-y divide-gray-100">
								{cart.map((item) => (
									<div key={item.id} className="p-3 hover:bg-blue-50/20 transition-colors group relative">
										<div className="flex justify-between items-start mb-1.5">
											<div className="pr-4">
												<div className="font-bold text-gray-800 text-sm">{item.name}</div>
												<div className="text-[10px] text-gray-400 mt-0.5">{item.code}</div>
											</div>
										</div>

										<div className="flex items-center justify-between">
											{/* Quantity Control - Styled like compact buttons */}
											<div className="flex items-center">
												<Button
													onClick={() => updateQty(item.id, -1)}
													className="w-6 h-6 flex items-center justify-center rounded-l border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
												>
													<Minus className="w-3 h-3" />
												</Button>
												<div className="h-6 w-8 flex items-center justify-center border-t border-b border-gray-200 bg-white text-xs font-bold text-gray-800">
													{item.qty}
												</div>
												<Button
													onClick={() => updateQty(item.id, 1)}
													className="w-6 h-6 flex items-center justify-center rounded-r border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
												>
													<Plus className="w-3 h-3" />
												</Button>
											</div>

											<Button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 p-1">
												<Trash2 className="w-3.5 h-3.5" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</ScrollArea>
					)}
				</TabsContent>
				<TabsContent value="info" className="flex-1 p-4 mt-0">
					<p className="text-xs text-gray-400">Additional options...</p>
				</TabsContent>

				{/* Footer Actions */}
				<div className="p-3 bg-gray-50 border-t space-y-2 shrink-0">
					<div className="flex justify-between items-center px-1">
						<span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Quantity</span>
						<span className="text-lg font-bold text-gray-800">
							{totalQty} {totalQty === 1 ? "item" : "items"}
						</span>
					</div>
					<div className="grid grid-cols-2 gap-2">
						<Button
							variant="outline"
							className="h-9 uppercase tracking-wide text-[10px] font-bold text-gray-500 border-gray-300"
							onClick={() => clearCart()}
							disabled={cart.length === 0}
						>
							Clear
						</Button>
						<Button
							className="h-9 uppercase tracking-wide text-[10px] font-bold bg-blue-600 hover:bg-blue-700 shadow-sm"
							disabled={cart.length === 0}
							onClick={handleProceed}
						>
							Confirm
						</Button>
					</div>
				</div>
			</div>
		</Tabs>
	);
}
