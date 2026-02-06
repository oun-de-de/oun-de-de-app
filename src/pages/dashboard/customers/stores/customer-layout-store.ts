import { createGenericStore, type GenericStoreState } from "@/core/store/create-generic-store";

const createInitialLayoutState = (): GenericStoreState => ({
	activeActionKey: "create-customer",
});

export const useCustomerLayoutStore = createGenericStore(createInitialLayoutState);

export const useCustomerLayoutState = () => useCustomerLayoutStore((store) => store.state);
export const useCustomerLayoutActions = () => useCustomerLayoutStore((store) => store.actions);
