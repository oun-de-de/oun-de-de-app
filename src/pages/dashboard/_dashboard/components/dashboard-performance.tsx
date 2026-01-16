
import { useEffect } from "react";
import { styled } from "styled-components";
import { rgbAlpha } from "@/core/utils/theme";
import { usePerformanceActions, usePerformanceState } from "../stores/performance/performance-store";
import PerformanceCard, { PerformanceLoadingCard } from "./card/performance-card";
import { ErrorState, isErrorState, isLoadingState } from "@/core/types/state";

export default function DashboardPerformance() {
	const state = usePerformanceState();

	const { fetch } = usePerformanceActions();

	useEffect(() => {
		void fetch();
	}, [fetch]);

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
}

//#region Styled Components
const StyledPerformanceWrapper = styled.div`
    border-top: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[400], 0.4)};
`;
//#endregion