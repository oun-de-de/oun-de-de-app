import { create } from "zustand";
import { CustomerInfoInitialState, type CustomerInfoState } from "./customer-info-state";
import {
	CustomerInfoLoadFirstErrorState,
	CustomerInfoLoadFirstLoadingState,
	CustomerInfoLoadFirstSuccessState,
} from "./states/get-state";
import { BaseStore } from "@/core/interfaces/base-store";
import { GetCustomerInfoUseCase } from "@/core/domain/dashboard/usecases/get-customer-info-use-case";
import {
	CustomerInfoRepository,
	CustomerInfoRepositoryImpl,
} from "@/core/domain/dashboard/repositories/customer-info-repository";
import { createBoundStore } from "@/core/utils/create-bound-store";
import { Repository } from "@/service-locator";

type CustomerInfoActions = {
	fetch: () => Promise<void>;
};

export interface CustomerInfoStore extends BaseStore<CustomerInfoState, CustomerInfoActions> {
	state: CustomerInfoState;
	actions: {
		fetch: () => Promise<void>;
	};
}

type Deps = {
	customerRepo: CustomerInfoRepository;
};

const createCustomerInfoStore = ({ customerRepo }: Deps) =>
	create<CustomerInfoStore>((set, get) => ({
		state: CustomerInfoInitialState(),
		actions: {
			async fetch() {
				set({
					state: CustomerInfoLoadFirstLoadingState(get().state),
				});

				const result = await new GetCustomerInfoUseCase(customerRepo).getCustomerInfo();

				result.fold(
					(failure) => {
						set({
							state: CustomerInfoLoadFirstErrorState(get().state, failure),
						});
					},
					(list) => {
						set({
							state: CustomerInfoLoadFirstSuccessState(get().state, list),
						});
					},
				);
			},
		},
	}));

export const customerInfoBoundStore = createBoundStore<CustomerInfoStore>({
	createStore: () =>
		createCustomerInfoStore({
			customerRepo: Repository.get<CustomerInfoRepository>(CustomerInfoRepositoryImpl),
		}),
});
