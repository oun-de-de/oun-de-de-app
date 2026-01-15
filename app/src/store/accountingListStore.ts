import { createListStore, type ListState } from "./createListStore";

const createInitialState = (): ListState => ({
	typeFilter: "journal",
	fieldFilter: "field-name",
	searchValue: "",
	page: 1,
	pageSize: 10,
});

const useAccountingListStore = createListStore(createInitialState());

export const useAccountingList = () =>
	useAccountingListStore((store) => store.state);

export const useAccountingListActions = () =>
	useAccountingListStore((store) => store.actions);
