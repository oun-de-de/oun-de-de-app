import type { EmployeeState } from "../employee-state";
import { _EmployeeState, createEmployeeInitialState } from "../employee-state";

export const EmployeeUpdateState = (state: EmployeeState, patch: Partial<Omit<EmployeeState, "type">>): EmployeeState =>
	_EmployeeState({
		state,
		type: "UpdateState",
		patch,
	});

export const EmployeeResetState = (): EmployeeState =>
	_EmployeeState({
		state: createEmployeeInitialState(),
		type: "ResetState",
	});
