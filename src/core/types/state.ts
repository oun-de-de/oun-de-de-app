// Common state interfaces for feature stores
import type { FailureType } from "./failure";

export type BaseState<Type extends string = string> = {
	type: Type;
};

export type ErrorState = {
	error: FailureType;
};

export type LoadingState = {};

export type EmptyState = {};

export type ActionState = {
	callTime: Date;
};

export type ResetState = {};

export const hasType = <T extends { type: string }, K extends T["type"]>(
	state: T,
	type: K,
): state is T & { type: K } => {
	return state?.type === type;
};

export const isErrorState = <T extends BaseState>(state: T): state is T & ErrorState => {
	return state && "error" in state;
};

export const isLoadingState = <T extends BaseState>(state: T): state is T & LoadingState => {
	return typeof state?.type === "string" && state.type.toLowerCase().includes("loading");
};

export const isEmptyState = <T extends BaseState>(state: T): state is T & EmptyState => {
	return typeof state?.type === "string" && state.type.toLowerCase().includes("empty");
};
