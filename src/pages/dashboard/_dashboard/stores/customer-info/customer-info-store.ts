import { create } from "zustand";
import { CustomerInfoInitialState, type CustomerInfoState } from "./customer-info-state";
import {
	CustomerInfoLoadFirstErrorState,
	CustomerInfoLoadFirstLoadingState,
	CustomerInfoLoadFirstSuccessState,
} from "./states/get-state";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { BaseStore } from "@/core/types/base-store";
import { GetCustomerInfoUseCase } from "@/core/domain/dashboard/usecases/get-customer-info-use-case";
import {
	CustomerInfoRepository,
	CustomerInfoRepositoryImpl,
} from "@/core/domain/dashboard/repositories/customer-info-repository";
import Repository from "@/service-locator";

type Deps = {
	customerRepo: CustomerInfoRepository;
};

const depsValue: Deps = {
	customerRepo: Repository.get<CustomerInfoRepository>(CustomerInfoRepositoryImpl),
};

export type CustomerInfoStore = BaseStore<
	CustomerInfoState,
	{
		fetch: () => Promise<void>;
	}
>;

export const { useState, useAction } = createBoundStore<
	CustomerInfoStore["state"],
	CustomerInfoStore["actions"],
	CustomerInfoStore,
	Deps
>({
	deps: depsValue,
	createStore: ({ customerRepo }) =>
		create<CustomerInfoStore>((set, get) => ({
			state: CustomerInfoInitialState(),
			actions: {
				async fetch() {
					const currentState = get().state;

					set({
						state: CustomerInfoLoadFirstLoadingState(currentState),
					});

					const result = await new GetCustomerInfoUseCase(customerRepo).getCustomerInfo();

					result.fold(
						(failure) => {
							set({
								state: CustomerInfoLoadFirstErrorState(currentState, failure),
							});
						},
						(list) => {
							set({
								state: CustomerInfoLoadFirstSuccessState(currentState, list),
							});
						},
					);
				},
			},
		})),
});

export const useCustomerInfoState = useState;
export const useCustomerInfoActions = useAction;
