import { _SettingsState, type SettingsState } from "../settings-state";

export const SettingsSelectItemLoadingState = (state: SettingsState): SettingsState =>
	_SettingsState({
		state,
		type: "SelectItemLoadingState",
	});

export const SettingsSelectItemSuccessState = (state: SettingsState, activeItem: string): SettingsState =>
	_SettingsState({
		state,
		type: "SelectItemSuccessState",
		activeItem,
	});

export const SettingsSelectItemErrorState = (state: SettingsState): SettingsState =>
	_SettingsState({
		state,
		type: "SelectItemErrorState",
	});
