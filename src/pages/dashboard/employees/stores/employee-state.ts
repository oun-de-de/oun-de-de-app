import type { SortingState } from "@tanstack/react-table";
import type { ListState } from "@/core/store/createListStore";
import type { BaseState } from "@/core/types/state";

type EmployeeStoreType = "InitialState" | "UpdateState" | "ResetState";

export type EmployeeState = BaseState<EmployeeStoreType> &
	ListState & {
		sorting: SortingState;
	};

export const createEmployeeInitialState = (): EmployeeState => ({
	type: "InitialState",
	typeFilter: "all",
	fieldFilter: "username",
	searchValue: "",
	page: 1,
	pageSize: 10,
	sorting: [],
});

export const _EmployeeState = ({
	state,
	type,
	patch,
}: {
	state: EmployeeState;
	type: EmployeeStoreType;
	patch?: Partial<Omit<EmployeeState, "type">>;
}): EmployeeState => ({
	type,
	typeFilter: patch?.typeFilter ?? state.typeFilter,
	fieldFilter: patch?.fieldFilter ?? state.fieldFilter,
	searchValue: patch?.searchValue ?? state.searchValue,
	page: patch?.page ?? state.page,
	pageSize: patch?.pageSize ?? state.pageSize,
	sorting: patch?.sorting ?? state.sorting,
});
