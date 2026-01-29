import { StoreApi, UseBoundStore } from "zustand";
import { BaseStore } from "../interfaces/base-store";

export function createBoundStore<Store extends BaseStore<Store["state"], Store["actions"]>>({
	createStore,
}: {
	createStore: () => UseBoundStore<StoreApi<Store>>;
}) {
	let store: UseBoundStore<StoreApi<Store>> | null = null;

	function useBoundStore<T>(selector: (s: Store) => T): T {
		if (!store) {
			store = createStore();
		}
		return store(selector);
	}

	function useState(): Store["state"] {
		return useBoundStore((s) => s.state);
	}

	function useAction(): Store["actions"] {
		return useBoundStore((s) => s.actions);
	}

	function getStoreApi(): UseBoundStore<StoreApi<Store>> {
		if (!store) {
			store = createStore();
		}
		return store;
	}

	function subscribe(listener: (state: Store["state"], prevState: Store["state"]) => void): () => void {
		const storeApi = getStoreApi();
		const current = storeApi.getState();

		const unsubscribe = storeApi.subscribe((next, prev) => {
			listener(next, prev);
			current.actions.subscribe?.(next, prev);
		});

		return unsubscribe;
	}

	return { useState, useAction, getStoreApi, subscribe };
}
