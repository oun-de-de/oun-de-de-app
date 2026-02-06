import { create } from "zustand";

export type GenericStoreState<TData = unknown> = {
	activeActionKey: string;
	activeId?: string | null;
	activeData?: TData;
};

type GenericStore<TState> = {
	state: TState;
	actions: {
		setState: (next: Partial<TState> | ((prev: TState) => Partial<TState>)) => void;
		reset: () => void;
	};
};

// Factory tạo store-hook
export const createGenericStore = <TState extends object>(initialStateOrFactory: TState | (() => TState)) => {
	const getInitialState = (): TState => {
		return typeof initialStateOrFactory === "function"
			? (initialStateOrFactory as () => TState)()
			: initialStateOrFactory;
	};

	return create<GenericStore<TState>>((set, _get) => ({
		state: getInitialState(),

		actions: {
			setState: (next) =>
				set((store) => {
					const patch = typeof next === "function" ? next(store.state) : next;
					return { state: { ...store.state, ...patch } };
				}),

			reset: () => set({ state: getInitialState() }),
		},
	}));
};
