import { createListStore, type ListState } from "@/core/store/createListStore";

export interface BorrowListState extends ListState {
	activeView: "all" | "requests";
}

const createInitialState = (): BorrowListState => ({
	typeFilter: "all",
	fieldFilter: "field-name",
	searchValue: "",
	page: 1,
	pageSize: 10,
	activeView: "all",
});

const useBorrowListStore = createListStore(createInitialState());

export const useBorrowList = () => useBorrowListStore((store) => store.state);

export const useBorrowListActions = () => useBorrowListStore((store) => store.actions);
