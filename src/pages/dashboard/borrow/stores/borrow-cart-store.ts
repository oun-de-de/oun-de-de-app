import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BaseStore } from "@/core/interfaces/base-store";
import { createBoundStore } from "@/core/utils/create-bound-store";
import type { BorrowCartPersistedState, BorrowCartState, CartItem } from "./borrow-cart-state";
import { createBorrowCartInitialState } from "./borrow-cart-state";
import {
	BorrowCartAddItemState,
	BorrowCartClearState,
	BorrowCartHydrateState,
	BorrowCartRemoveItemState,
	BorrowCartUpdateQtyState,
} from "./states/borrow-cart-get-state";

export type { CartItem } from "./borrow-cart-state";

export interface BorrowCartActions {
	addToCart: (item: Omit<CartItem, "qty">) => void;
	removeFromCart: (id: string) => void;
	updateQty: (id: string, delta: number) => void;
	clearCart: () => void;
}

export interface BorrowCartStore extends BaseStore<BorrowCartState, BorrowCartActions> {}

const isBorrowCartPersistedState = (value: unknown): value is BorrowCartPersistedState => {
	if (!value || typeof value !== "object") return false;
	const maybeState = (value as { state?: unknown }).state;
	if (!maybeState || typeof maybeState !== "object") return false;
	const maybeCart = (maybeState as { cart?: unknown }).cart;
	return Array.isArray(maybeCart);
};

const createBorrowCartStore = () =>
	create<BorrowCartStore>()(
		persist<BorrowCartStore, [], [], BorrowCartPersistedState>(
			(set, get) => ({
				state: createBorrowCartInitialState(),
				actions: {
					addToCart: (item) => set({ state: BorrowCartAddItemState(get().state, item) }),
					removeFromCart: (id) => set({ state: BorrowCartRemoveItemState(get().state, id) }),
					updateQty: (id, delta) => set({ state: BorrowCartUpdateQtyState(get().state, id, delta) }),
					clearCart: () => set({ state: BorrowCartClearState(get().state) }),
				},
			}),
			{
				name: "borrow-cart-storage",
				partialize: (store): BorrowCartPersistedState => ({
					state: {
						cart: store.state.cart,
					},
				}),
				merge: (persistedState: unknown, currentState: BorrowCartStore): BorrowCartStore => {
					if (!isBorrowCartPersistedState(persistedState)) {
						return currentState;
					}

					return {
						...currentState,
						state: BorrowCartHydrateState(currentState.state, persistedState.state.cart),
					};
				},
			},
		),
	);

export const borrowCartBoundStore = createBoundStore<BorrowCartStore>({
	createStore: createBorrowCartStore,
});

export const useBorrowCartState = () => borrowCartBoundStore.useState();
export const useBorrowCartActions = () => borrowCartBoundStore.useAction();
const useBorrowCartStore = borrowCartBoundStore.getStoreApi();

export const useBorrowCartSelector = <T>(selector: (state: BorrowCartState) => T): T =>
	useBorrowCartStore((store) => selector(store.state));

export const useCartTotal = () =>
	useBorrowCartSelector((state) => state.cart.reduce((sum, item) => sum + item.price * item.qty, 0));

export const useCartTotalQty = () =>
	useBorrowCartSelector((state) => state.cart.reduce((sum, item) => sum + item.qty, 0));
