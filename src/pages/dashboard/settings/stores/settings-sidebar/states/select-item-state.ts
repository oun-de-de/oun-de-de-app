import { _SettingsSidebarState, type SettingsSidebarState } from "../settings-sidebar-state";

export const SettingsSidebarSelectItemLoadingState = (state: SettingsSidebarState): SettingsSidebarState =>
	_SettingsSidebarState({
		state,
		type: "SelectItemLoadingState",
	});

export const SettingsSidebarSelectItemSuccessState = (
	state: SettingsSidebarState,
	activeItem: string,
): SettingsSidebarState =>
	_SettingsSidebarState({
		state,
		type: "SelectItemSuccessState",
		activeItem,
	});

export const SettingsSidebarSelectItemErrorState = (state: SettingsSidebarState): SettingsSidebarState =>
	_SettingsSidebarState({
		state,
		type: "SelectItemErrorState",
	});
