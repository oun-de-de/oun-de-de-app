import { createListStore, type ListState } from "@/core/store/createListStore";

const createInitialState = (): ListState => ({
	typeFilter: "all",
	fieldFilter: "all",
	searchValue: "",
	page: 1,
	pageSize: 10,
});

const useProductsListStore = createListStore(createInitialState());

export const useProductsList = () => useProductsListStore((store) => store.state);

export const useProductsListActions = () => useProductsListStore((store) => store.actions);
