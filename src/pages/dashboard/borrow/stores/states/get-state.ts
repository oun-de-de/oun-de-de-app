import type { BorrowState } from "../borrow-state";
import { _BorrowState, createBorrowInitialState } from "../borrow-state";

export const BorrowUpdateState = (state: BorrowState, patch: Partial<Omit<BorrowState, "type">>): BorrowState =>
	_BorrowState({
		state,
		type: "UpdateState",
		patch,
	});

export const BorrowResetState = (): BorrowState =>
	_BorrowState({
		state: createBorrowInitialState(),
		type: "ResetState",
	});
