import { createListStore, type ListState } from "@/core/store/createListStore";

const createInitialState = (): ListState => ({
	typeFilter: "all",
	fieldFilter: "all",
	searchValue: "",
	page: 1,
	pageSize: 20,
});

const useAccountingCenterListStore = createListStore(createInitialState());

export const useAccountingCenterList = () => useAccountingCenterListStore((store) => store.state);

export const useAccountingCenterListActions = () => useAccountingCenterListStore((store) => store.actions);
