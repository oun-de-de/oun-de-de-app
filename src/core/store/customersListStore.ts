import { createListStore, type ListState } from "./createListStore";

const createInitialState = (): ListState => ({
	typeFilter: "all",
	fieldFilter: "field-name",
	searchValue: "",
	page: 1,
	pageSize: 10,
});

const useCustomersListStore = createListStore(createInitialState());

export const useCustomersList = () =>
	useCustomersListStore((store) => store.state);

export const useCustomersListActions = () =>
	useCustomersListStore((store) => store.actions);
