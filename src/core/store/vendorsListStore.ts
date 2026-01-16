import { createListStore, type ListState } from "./createListStore";

const createInitialState = (): ListState => ({
	typeFilter: "all",
	fieldFilter: "field-name",
	searchValue: "",
	page: 1,
	pageSize: 10,
});

const useVendorsListStore = createListStore(createInitialState());

export const useVendorsList = () =>
	useVendorsListStore((store) => store.state);

export const useVendorsListActions = () =>
	useVendorsListStore((store) => store.actions);
