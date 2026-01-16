import { create } from "zustand";

export type ListState = {
	typeFilter: string;
	fieldFilter: string;
	searchValue: string;
	page: number;
	pageSize: number;
};

type ListStore = {
	state: ListState;
	actions: {
		updateState: (next: Partial<ListState>) => void;
	};
};

export const createListStore = (initialState: ListState) =>
	create<ListStore>((set) => ({
		state: initialState,
		actions: {
			updateState: (next) =>
				set((store) => ({
					state: { ...store.state, ...next },
				})),
		},
	}));
