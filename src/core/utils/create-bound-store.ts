import { StoreApi, UseBoundStore } from "zustand";
import { BaseStore } from "../types/base-store";

export function createBoundStore<Store extends BaseStore, Deps extends Record<string, object>>({
	deps,
	createStore,
}: {
	deps: Deps;
	createStore: (resolved: Deps) => UseBoundStore<StoreApi<Store>>;
}) {
	let store: UseBoundStore<StoreApi<Store>> | null = null;

	function useBoundStore<T>(selector: (s: Store) => T): T {
		if (!store) {
			store = createStore(deps);
		}
		return store(selector);
	}

	function useState(): Store["state"] {
		return useBoundStore((s) => s.state);
	}

	function useAction(): Store["actions"] {
		return useBoundStore((s) => s.actions);
	}

	return { useState, useAction };
}
