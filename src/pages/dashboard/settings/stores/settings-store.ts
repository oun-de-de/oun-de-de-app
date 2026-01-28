import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { settingsLeftMenu } from "@/_mock/data/dashboard";
import type { BaseStore } from "@/core/types/base-store";
import type { SettingsRow } from "@/core/types/common";
import { StorageEnum } from "@/core/types/enum";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { _SettingsState, SettingsInitialState, type SettingsState } from "./settings-state";
import { SettingsSelectItemLoadingState, SettingsSelectItemSuccessState } from "./states/select-item-state";

type SettingsActions = {
	selectItem: (item: string) => void;
	reset: () => void;
	// Form actions
	openCreateForm: () => void;
	openEditForm: (item: SettingsRow) => void;
	closeForm: () => void;
};

export interface SettingsStore extends BaseStore<SettingsState, SettingsActions> {
	state: SettingsState;
	actions: SettingsActions;
}

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
					// Form actions
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

export const settingsBoundStore = createBoundStore<SettingsStore>({
	createStore: () => createSettingsStore(settingsLeftMenu),
});

// Convenience hooks
export const useSettingsState = () => settingsBoundStore.useState();
export const useSettingsActions = () => settingsBoundStore.useAction();
export const useActiveItem = () => settingsBoundStore.useState().activeItem;
export const useFormState = () => {
	const state = settingsBoundStore.useState();
	return {
		showForm: state.showForm,
		editItem: state.editItem,
		formMode: state.formMode,
	};
};

export const getSettingsActions = () => settingsBoundStore.getStoreApi().getState().actions;
