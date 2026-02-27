import type { InvoiceState } from "../invoice-state";
import { _InvoiceState, createInvoiceInitialState } from "../invoice-state";

export const InvoiceUpdateState = (state: InvoiceState, patch: Partial<Omit<InvoiceState, "type">>): InvoiceState =>
	_InvoiceState({
		state,
		type: "UpdateState",
		patch,
	});

export const InvoiceResetState = (): InvoiceState =>
	_InvoiceState({
		state: createInvoiceInitialState(),
		type: "ResetState",
	});
