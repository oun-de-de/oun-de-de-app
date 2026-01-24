import { create } from "zustand";
import { settingsLeftMenu } from "@/_mock/data/dashboard";
import type { BaseStore } from "@/core/types/base-store";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { SettingsSidebarInitialState, type SettingsSidebarState } from "./settings-sidebar-state";
import {
	SettingsSidebarSelectItemLoadingState,
	SettingsSidebarSelectItemSuccessState,
} from "./states/select-item-state";

type SettingsSidebarActions = {
	selectItem: (item: string) => void;
	reset: () => void;
};

export interface SettingsSidebarStore extends BaseStore<SettingsSidebarState, SettingsSidebarActions> {
	state: SettingsSidebarState;
	actions: SettingsSidebarActions;
}

const createSettingsSidebarStore = (items: string[]) =>
	create<SettingsSidebarStore>((set, get) => ({
		state: SettingsSidebarInitialState(items),
		actions: {
			selectItem(item: string) {
				set({ state: SettingsSidebarSelectItemLoadingState(get().state) });

				// Simulate async operation if needed, otherwise just set directly
				set({ state: SettingsSidebarSelectItemSuccessState(get().state, item) });
			},
			reset() {
				set({ state: SettingsSidebarInitialState(items) });
			},
		},
	}));

export const settingsSidebarBoundStore = createBoundStore<SettingsSidebarStore>({
	createStore: () => createSettingsSidebarStore(settingsLeftMenu),
});

// Convenience hooks
export const useSettingsSidebarState = () => settingsSidebarBoundStore.useState();
export const useSettingsSidebarActions = () => settingsSidebarBoundStore.useAction();
export const useActiveItem = () => settingsSidebarBoundStore.useState().activeItem;
