import type { ListState } from "@/core/store/createListStore";
import type { BaseState } from "@/core/types/state";

type BorrowType = "InitialState" | "UpdateState" | "ResetState";
export type BorrowTypeFilter = "all" | "employee" | "customer";

export type BorrowState = BaseState<BorrowType> &
	Omit<ListState, "typeFilter" | "fieldFilter"> & {
		typeFilter: BorrowTypeFilter;
		activeView: "all" | "requests";
	};

export const createBorrowInitialState = (): BorrowState => ({
	type: "InitialState",
	typeFilter: "all",
	searchValue: "",
	page: 1,
	pageSize: 10,
	activeView: "all",
});

export const _BorrowState = ({
	state,
	type,
	patch,
}: {
	state: BorrowState;
	type: BorrowType;
	patch?: Partial<Omit<BorrowState, "type">>;
}): BorrowState => ({
	type,
	typeFilter: patch?.typeFilter ?? state.typeFilter,
	searchValue: patch?.searchValue ?? state.searchValue,
	page: patch?.page ?? state.page,
	pageSize: patch?.pageSize ?? state.pageSize,
	activeView: patch?.activeView ?? state.activeView,
});
