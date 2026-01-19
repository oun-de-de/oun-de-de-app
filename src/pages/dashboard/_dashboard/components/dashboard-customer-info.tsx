import { useEffect } from "react";
import { isErrorState, isLoadingState, type ErrorState } from "@/core/types/state";
import CustomerInfoCard, { CustomerInfoCardLoading } from "./card/customer-info-card";
import { CustomerInfoStore } from "../stores/customer-info/customer-info-store";
import { useStore } from "@/core/ui/store/multi-store-provider";
import { StoreBuilder } from "@/core/ui/store/store-builder";

export default function DashboardCustomerInfo() {
	const store = useStore<CustomerInfoStore>("customerInfo");
	const { fetch } = store.useAction();

	useEffect(() => {
		void fetch();
	}, [fetch]);

	return (
		<StoreBuilder<CustomerInfoStore>
			store={store}
			builder={(state) => {
				if (isLoadingState(state) && state.list.length === 0) {
					return <CustomerInfoCardLoading />;
				}

				if (isErrorState(state)) {
					const errorState = state as ErrorState;
					return (
						<div className="flex h-[120px] items-center justify-center text-sm text-red-500">
							{errorState.error.message}
						</div>
					);
				}

				return (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{state.list.map((item) => (
							<CustomerInfoCard key={item.id} item={item} />
						))}
					</div>
				);
			}}
		/>
	);
}
