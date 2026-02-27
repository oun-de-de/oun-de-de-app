import { _BorrowCartState, type BorrowCartState, type CartItem } from "../borrow-cart-state";

export const BorrowCartHydrateState = (state: BorrowCartState, cart: CartItem[]): BorrowCartState =>
	_BorrowCartState({
		state,
		type: "HydrateState",
		patch: { cart },
	});

export const BorrowCartAddItemState = (state: BorrowCartState, item: Omit<CartItem, "qty">): BorrowCartState => {
	if (item.inStock <= 0) return state;

	const existing = state.cart.find((i) => i.id === item.id);
	if (existing) {
		const nextQty = Math.min(existing.inStock, existing.qty + 1);
		return _BorrowCartState({
			state,
			type: "AddItemState",
			patch: {
				cart: state.cart.map((i) => (i.id === item.id ? { ...i, qty: nextQty } : i)),
			},
		});
	}

	return _BorrowCartState({
		state,
		type: "AddItemState",
		patch: { cart: [...state.cart, { ...item, qty: 1 }] },
	});
};

export const BorrowCartRemoveItemState = (state: BorrowCartState, id: string): BorrowCartState =>
	_BorrowCartState({
		state,
		type: "RemoveItemState",
		patch: {
			cart: state.cart.filter((i) => i.id !== id),
		},
	});

export const BorrowCartUpdateQtyState = (state: BorrowCartState, id: string, delta: number): BorrowCartState =>
	_BorrowCartState({
		state,
		type: "UpdateQtyState",
		patch: {
			cart: state.cart.map((i) => {
				if (i.id !== id) return i;
				const maxQty = Math.max(1, i.inStock);
				const nextQty = Math.min(maxQty, Math.max(1, i.qty + delta));
				return { ...i, qty: nextQty };
			}),
		},
	});

export const BorrowCartClearState = (state: BorrowCartState): BorrowCartState =>
	_BorrowCartState({
		state,
		type: "ClearState",
		patch: { cart: [] },
	});
