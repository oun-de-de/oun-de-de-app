import type { BaseState } from "@/core/types/state";

type SettingsSidebarType =
	| "InitialState"
	| "SelectItemLoadingState"
	| "SelectItemSuccessState"
	| "SelectItemErrorState";

export type SettingsSidebarState = BaseState<SettingsSidebarType> & {
	activeItem: string;
	items: string[];
};

export const SettingsSidebarInitialState = (items: string[]): SettingsSidebarState => ({
	type: "InitialState",
	activeItem: items[0] ?? "",
	items,
});

export const _SettingsSidebarState = ({
	state,
	type,
	activeItem,
	items,
}: {
	state: SettingsSidebarState;
	type: SettingsSidebarType;
	activeItem?: string;
	items?: string[];
}): SettingsSidebarState => ({
	type,
	activeItem: activeItem ?? state.activeItem,
	items: items ?? state.items,
});
