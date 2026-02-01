import { createListStore, type ListState } from "@/core/store/createListStore";

const createInitialState = (): ListState => ({
	typeFilter: "all",
	fieldFilter: "all",
	searchValue: "",
	page: 1,
	pageSize: 10,
});

const useCouponsListStore = createListStore(createInitialState());

export const useCouponsList = () => useCouponsListStore((store) => store.state);

export const useCouponsListActions = () => useCouponsListStore((store) => store.actions);
