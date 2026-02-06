import { createListStore, type ListState } from "@/core/store/createListStore";

const createInitialListState = (): ListState => ({
	typeFilter: "all",
	fieldFilter: "name",
	searchValue: "",
	page: 1,
	pageSize: 10,
});

export const useCustomerListStore = createListStore(createInitialListState());

export const useCustomerListState = () => useCustomerListStore((store) => store.state);
export const useCustomerListActions = () => useCustomerListStore((store) => store.actions);

export type { ListState };
