import { create } from "zustand";
import type { BaseStore } from "@/core/interfaces/base-store";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { createInvoiceInitialState, type InvoiceState } from "./invoice-state";
import { InvoiceResetState, InvoiceUpdateState } from "./states/get-state";

export type { InvoiceState } from "./invoice-state";

type InvoiceActions = {
	updateState: (next: Partial<Omit<InvoiceState, "type">>) => void;
	reset: () => void;
};

export interface InvoiceStore extends BaseStore<InvoiceState, InvoiceActions> {
	state: InvoiceState;
	actions: InvoiceActions;
}

const createInvoiceStore = () =>
	create<InvoiceStore>((set, get) => ({
		state: createInvoiceInitialState(),
		actions: {
			updateState: (next) =>
				set({
					state: InvoiceUpdateState(get().state, next),
				}),
			reset: () =>
				set({
					state: InvoiceResetState(),
				}),
		},
	}));

export const invoiceBoundStore = createBoundStore<InvoiceStore>({
	createStore: createInvoiceStore,
});

export const getInvoiceState = () => invoiceBoundStore.getStoreApi().getState().state;

export const useInvoiceState = () => invoiceBoundStore.useState();
export const useInvoiceActions = () => invoiceBoundStore.useAction();
