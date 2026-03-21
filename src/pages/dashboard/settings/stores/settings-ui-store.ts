import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BaseStore } from "@/core/interfaces/base-store";
import type { SettingsRow } from "@/core/types/common";
import { StorageEnum } from "@/core/types/enum";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { SETTINGS_MENU_BY_TAB, SETTINGS_TOP_TABS } from "../constants";
import { _SettingsState, SettingsInitialState, type SettingsState } from "./settings-state";
import { SettingsSelectItemLoadingState, SettingsSelectItemSuccessState } from "./states/select-item-state";

type SettingsActions = {
	selectItem: (item: string) => void;
	reset: () => void;
	openCreateForm: () => void;
	openEditForm: (item: SettingsRow) => void;
	closeForm: () => void;
};

export interface SettingsStore extends BaseStore<SettingsState, SettingsActions> {
	state: SettingsState;
	actions: SettingsActions;
}

const DEFAULT_SETTINGS_ITEMS = SETTINGS_MENU_BY_TAB[SETTINGS_TOP_TABS[0]];

const createSettingsStore = (items: string[]) =>
	create<SettingsStore>()(
		persist(
			(set, get) => ({
				state: SettingsInitialState(items),
				actions: {
					selectItem(item: string) {
						set({ state: SettingsSelectItemLoadingState(get().state) });
						set({ state: SettingsSelectItemSuccessState(get().state, item) });
					},
					reset() {
						set({ state: SettingsInitialState(items) });
					},
					openCreateForm() {
						set({
							state: _SettingsState({
								state: get().state,
								type: get().state.type,
								showForm: true,
								editItem: null,
								formMode: "create",
							}),
						});
					},
					openEditForm(item: SettingsRow) {
						set({
							state: _SettingsState({
								state: get().state,
								type: get().state.type,
								showForm: true,
								editItem: item,
								formMode: "edit",
							}),
						});
					},
					closeForm() {
						set({
							state: _SettingsState({
								state: get().state,
								type: get().state.type,
								showForm: false,
								editItem: null,
								formMode: "create",
							}),
						});
					},
				},
			}),
			{
				name: StorageEnum.Settings,
				storage: createJSONStorage(() => localStorage),
				partialize: (store) => ({
					state: {
						activeItem: store.state.activeItem,
					},
				}),
				merge: (persistedState, currentState) => {
					const typedPersistedState = persistedState as SettingsStore | undefined;
					if (typedPersistedState?.state) {
						return {
							...currentState,
							state: {
								...currentState.state,
								activeItem: typedPersistedState.state.activeItem || currentState.state.activeItem,
							},
						};
					}
					return currentState;
				},
			},
		),
	);

export const settingsUiBoundStore = createBoundStore<SettingsStore>({
	createStore: () => createSettingsStore(DEFAULT_SETTINGS_ITEMS),
});

export const useSettingsState = () => settingsUiBoundStore.useState();
export const useSettingsActions = () => settingsUiBoundStore.useAction();
export const useActiveItem = () => settingsUiBoundStore.useState().activeItem;
export const useFormState = () => {
	const state = settingsUiBoundStore.useState();
	return {
		showForm: state.showForm,
		editItem: state.editItem,
		formMode: state.formMode,
	};
};

export const getSettingsActions = () => settingsUiBoundStore.getStoreApi().getState().actions;
