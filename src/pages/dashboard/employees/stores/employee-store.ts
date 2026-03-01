import { create } from "zustand";
import type { BaseStore } from "@/core/interfaces/base-store";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { createEmployeeInitialState, type EmployeeState } from "./employee-state";
import { EmployeeResetState, EmployeeUpdateState } from "./states/get-state";

export type { EmployeeState } from "./employee-state";

type EmployeeActions = {
	updateState: (next: Partial<Omit<EmployeeState, "type">>) => void;
	reset: () => void;
};

export interface EmployeeStore extends BaseStore<EmployeeState, EmployeeActions> {
	state: EmployeeState;
	actions: EmployeeActions;
}

const createEmployeeStore = () =>
	create<EmployeeStore>((set, get) => ({
		state: createEmployeeInitialState(),
		actions: {
			updateState: (next) =>
				set({
					state: EmployeeUpdateState(get().state, next),
				}),
			reset: () =>
				set({
					state: EmployeeResetState(),
				}),
		},
	}));

export const employeeBoundStore = createBoundStore<EmployeeStore>({
	createStore: createEmployeeStore,
});

export const getEmployeeState = () => employeeBoundStore.getStoreApi().getState().state;

export const useEmployeeState = () => employeeBoundStore.useState();
export const useEmployeeActions = () => employeeBoundStore.useAction();
