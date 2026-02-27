import type { BaseState } from "@/core/types/state";

export type CartItem = {
	id: string;
	code: string;
	name: string;
	price: number;
	inStock: number;
	qty: number;
};

type BorrowCartType =
	| "InitialState"
	| "HydrateState"
	| "AddItemState"
	| "RemoveItemState"
	| "UpdateQtyState"
	| "ClearState";

export type BorrowCartState = BaseState<BorrowCartType> & {
	cart: CartItem[];
};

export type BorrowCartStatePatch = Partial<Omit<BorrowCartState, "type">>;

export type BorrowCartPersistedState = {
	state: {
		cart: CartItem[];
	};
};

export const createBorrowCartInitialState = (): BorrowCartState => ({
	type: "InitialState",
	cart: [],
});

export const _BorrowCartState = ({
	state,
	type,
	patch,
}: {
	state: BorrowCartState;
	type: BorrowCartType;
	patch?: BorrowCartStatePatch;
}): BorrowCartState => ({
	type,
	cart: patch?.cart ?? state.cart,
});
