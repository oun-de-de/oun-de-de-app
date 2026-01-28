import { create } from "zustand";

export type ListState = {
	typeFilter: string;
	fieldFilter: string;
	searchValue: string;
	page: number;
	pageSize: number;
};

type ListStore<T extends ListState> = {
	state: T;
	actions: {
		updateState: (next: Partial<T>) => void;
	};
};

export const createListStore = <T extends ListState>(initialState: T) =>
	create<ListStore<T>>((set) => ({
		state: initialState,
		actions: {
			updateState: (next) =>
				set((store) => ({
					state: { ...store.state, ...next },
				})),
		},
	}));
