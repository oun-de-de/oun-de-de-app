import type { SortingState } from "@tanstack/react-table";
import type { ListState } from "@/core/store/createListStore";
import type { BaseState } from "@/core/types/state";

type InvoiceType = "InitialState" | "UpdateState" | "ResetState";

export type InvoiceState = BaseState<InvoiceType> &
	ListState & {
		sorting: SortingState;
	};

export const createInvoiceInitialState = (): InvoiceState => ({
	type: "InitialState",
	typeFilter: "all",
	fieldFilter: "all",
	searchValue: "",
	page: 1,
	pageSize: 10,
	sorting: [{ id: "date", desc: true }],
});

export const _InvoiceState = ({
	state,
	type,
	patch,
}: {
	state: InvoiceState;
	type: InvoiceType;
	patch?: Partial<Omit<InvoiceState, "type">>;
}): InvoiceState => ({
	type,
	typeFilter: patch?.typeFilter ?? state.typeFilter,
	fieldFilter: patch?.fieldFilter ?? state.fieldFilter,
	searchValue: patch?.searchValue ?? state.searchValue,
	page: patch?.page ?? state.page,
	pageSize: patch?.pageSize ?? state.pageSize,
	sorting: patch?.sorting ?? state.sorting,
});
