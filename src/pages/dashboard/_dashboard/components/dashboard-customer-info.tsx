import { useEffect } from "react";
import { useCustomerInfoActions, useCustomerInfoState } from "../stores/customer-info/customer-info-store";
import { isErrorState, isLoadingState, type ErrorState } from "@/core/types/state";
import CustomerInfoCard, { CustomerInfoCardLoading } from "./card/customer-info-card";

export default function DashboardCustomerInfo() {
	const state = useCustomerInfoState();
	const { fetch } = useCustomerInfoActions();

	useEffect(() => {
		void fetch();
	}, [fetch]);

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
				<CustomerInfoCard key={item.id} item={item}/>
			))}
		</div>
	);
}

