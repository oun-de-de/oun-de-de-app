import type { SettingsRow } from "@/core/types/common";
import type { BaseState } from "@/core/types/state";

type SettingsType = "InitialState" | "SelectItemLoadingState" | "SelectItemSuccessState" | "SelectItemErrorState";

type FormMode = "create" | "edit";

export type SettingsState = BaseState<SettingsType> & {
	activeItem: string;
	items: string[];
	// Form state
	showForm: boolean;
	editItem: SettingsRow | null;
	formMode: FormMode;
};

export const SettingsInitialState = (items: string[]): SettingsState => ({
	type: "InitialState",
	activeItem: items[0] ?? "",
	items,
	showForm: false,
	editItem: null,
	formMode: "create",
});

export const _SettingsState = ({
	state,
	type,
	activeItem,
	items,
	showForm,
	editItem,
	formMode,
}: {
	state: SettingsState;
	type: SettingsType;
	activeItem?: string;
	items?: string[];
	showForm?: boolean;
	editItem?: SettingsRow | null;
	formMode?: FormMode;
}): SettingsState => ({
	type,
	activeItem: activeItem ?? state.activeItem,
	items: items ?? state.items,
	showForm: showForm ?? state.showForm,
	editItem: editItem ?? state.editItem,
	formMode: formMode ?? state.formMode,
});
