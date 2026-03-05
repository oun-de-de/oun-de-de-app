import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { reportSections } from "@/_mock/data/dashboard";
import type { BaseStore } from "@/core/interfaces/base-store";
import { StorageEnum } from "@/core/types/enum";
import { createBoundStore } from "@/core/utils/create-bound-store";

const VALID_REPORT_KEYS = new Set(
	reportSections.flatMap((section) => section.items.flatMap((item) => [item.slug, item.label])),
);

function sanitizeFavorites(favorites: string[]) {
	return favorites.filter((favorite) => VALID_REPORT_KEYS.has(favorite));
}

function getSanitizedFavorites(state: ReportsState) {
	return sanitizeFavorites(state.favorites);
}

function toggleFavoriteItem(favorites: string[], reportKey: string) {
	return favorites.includes(reportKey) ? favorites.filter((item) => item !== reportKey) : [...favorites, reportKey];
}

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
							const favorites = getSanitizedFavorites(state);

							if (!VALID_REPORT_KEYS.has(reportKey)) {
								set({ state: { ...state, favorites } });
								return;
							}

							set({
								state: {
									...state,
									favorites: toggleFavoriteItem(favorites, reportKey),
								},
							});
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
								favorites: store.state.favorites,
							},
						}) as any,
					merge: (persistedState: any, currentState) => {
						const persistedFavorites = persistedState?.state?.favorites;
						if (!persistedFavorites) return currentState;

						return {
							...currentState,
							state: {
								...currentState.state,
								favorites: sanitizeFavorites(persistedFavorites),
							},
						};
					},
				},
			),
		),
});

// Helper hooks
export const useReportsState = () => reportsBoundStore.useState();
export const useReportsActions = () => reportsBoundStore.useAction();
