import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
	id: string;
	code: string;
	name: string;
	price: number;
	inStock: number;
	qty: number;
};

interface BorrowCartState {
	cart: CartItem[];
	addToCart: (item: Omit<CartItem, "qty">) => void;
	removeFromCart: (id: string) => void;
	updateQty: (id: string, delta: number) => void;
	clearCart: () => void;
}

export const useBorrowCartStore = create<BorrowCartState>()(
	persist(
		(set) => ({
			cart: [],
			addToCart: (item) =>
				set((state) => {
					const existing = state.cart.find((i) => i.id === item.id);
					if (existing) {
						return {
							cart: state.cart.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)),
						};
					}
					return { cart: [...state.cart, { ...item, qty: 1 }] };
				}),
			removeFromCart: (id) =>
				set((state) => ({
					cart: state.cart.filter((i) => i.id !== id),
				})),
			updateQty: (id, delta) =>
				set((state) => ({
					cart: state.cart.map((i) => {
						if (i.id === id) {
							const newQty = Math.max(1, i.qty + delta);
							return { ...i, qty: newQty };
						}
						return i;
					}),
				})),
			clearCart: () => set({ cart: [] }),
		}),
		{
			name: "borrow-cart-storage",
		},
	),
);

export const useCartTotal = () => {
	const cart = useBorrowCartStore((state) => state.cart);
	return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
};
