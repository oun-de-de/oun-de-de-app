import { create } from "zustand";
import type { BaseStore } from "@/core/interfaces/base-store";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { type BorrowState, createBorrowInitialState } from "./borrow-state";
import { BorrowResetState, BorrowUpdateState } from "./states/get-state";

export type { BorrowState } from "./borrow-state";

type BorrowActions = {
	updateState: (next: Partial<Omit<BorrowState, "type">>) => void;
	reset: () => void;
};

export interface BorrowStore extends BaseStore<BorrowState, BorrowActions> {
	state: BorrowState;
	actions: BorrowActions;
}

const createBorrowStore = () =>
	create<BorrowStore>((set, get) => ({
		state: createBorrowInitialState(),
		actions: {
			updateState: (next) =>
				set({
					state: BorrowUpdateState(get().state, next),
				}),
			reset: () =>
				set({
					state: BorrowResetState(),
				}),
		},
	}));

export const borrowBoundStore = createBoundStore<BorrowStore>({
	createStore: createBorrowStore,
});

export const useBorrowState = () => borrowBoundStore.useState();

export const useBorrowActions = () => borrowBoundStore.useAction();
