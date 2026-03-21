import { createListStore, type ListState } from "@/core/store/createListStore";

const createInitialState = (): ListState => ({
	typeFilter: "all",
	fieldFilter: "all",
	searchValue: "",
	page: 1,
	pageSize: 20,
});

const useAccountingListStore = createListStore(createInitialState());

export const useAccountingList = () => useAccountingListStore((store) => store.state);

export const useAccountingListActions = () => useAccountingListStore((store) => store.actions);
