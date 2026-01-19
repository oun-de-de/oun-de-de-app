import { useEffect } from "react";
import { styled } from "styled-components";
import { rgbAlpha } from "@/core/utils/theme";
import PerformanceCard, { PerformanceLoadingCard } from "./card/performance-card";
import { ErrorState, isErrorState, isLoadingState } from "@/core/types/state";
import { useStore } from "@/core/ui/store/multi-store-provider";
import { PerformanceStore } from "../stores/performance/performance-store";
import { StoreBuilder } from "@/core/ui/store/store-builder";

export default function DashboardPerformance() {
	const store = useStore<PerformanceStore>("performance");
	const { fetch } = store.useAction();

	useEffect(() => {
		void fetch();
	}, [fetch]);

	return (
		<StoreBuilder<PerformanceStore>
			store={store}
			builder={(state) => {
				if (isLoadingState(state) && state.list.length === 0) {
					return <PerformanceLoadingCard />;
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
					<StyledPerformanceWrapper>
						{state.list.map((item) => (
							<PerformanceCard key={item.id} item={item} />
						))}
					</StyledPerformanceWrapper>
				);
			}}
		/>
	);
}

//#region Styled Components
const StyledPerformanceWrapper = styled.div`
    border-top: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[400], 0.4)};
`;
//#endregion
