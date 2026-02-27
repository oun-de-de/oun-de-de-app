import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BaseStore } from "@/core/interfaces/base-store";
import { StorageEnum } from "@/core/types/enum";
import { createBoundStore } from "@/core/utils/create-bound-store";

export interface ReportsState {
	favorites: string[];
}

interface ReportsActions {
	toggleFavorite: (reportKey: string) => void;
	clearFavorites: () => void;
}

export interface ReportsStore extends BaseStore<ReportsState, ReportsActions> {
	state: ReportsState;
	actions: ReportsActions;
}

export const reportsBoundStore = createBoundStore<ReportsStore>({
	createStore: () =>
		create<ReportsStore>()(
			persist(
				(set, get) => ({
					state: {
						favorites: [],
					},
					actions: {
						toggleFavorite: (reportKey) => {
							const { state } = get();
							const { favorites } = state;
							const isFav = favorites.includes(reportKey);
							if (isFav) {
								set({ state: { ...state, favorites: favorites.filter((item) => item !== reportKey) } });
							} else {
								set({ state: { ...state, favorites: [...favorites, reportKey] } });
							}
						},
						clearFavorites: () => {
							const { state } = get();
							set({ state: { ...state, favorites: [] } });
						},
					},
				}),
				{
					name: StorageEnum.Reports,
					storage: createJSONStorage(() => localStorage),
					partialize: (store) =>
						({
							state: {
								...store.state,
								favorites: store.state.favorites,
							},
							// We need to match the structure expected by persist.
							// However, 'persist' wraps the whole store.
							// Based on settingStore, partialize returns the object to be saved.
							// SettingStore saves { settings: ... }, here we want to save the state.
						}) as any,
					merge: (persistedState: any, currentState) => {
						// We need to merge persisted state into the current structure
						if (persistedState?.state) {
							return {
								...currentState,
								state: {
									...currentState.state,
									favorites: persistedState.state.favorites || [],
								},
							};
						}
						return currentState;
					},
				},
			),
		),
});

// Helper hooks
export const useReportsState = () => reportsBoundStore.useState();
export const useReportsActions = () => reportsBoundStore.useAction();
