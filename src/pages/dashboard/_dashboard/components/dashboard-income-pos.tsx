import { rgbAlpha } from "@/core/utils/theme";
import { useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { styled } from "styled-components";
import { ErrorState, isErrorState } from "@/core/types/state";
import {
	DashboardRepository,
	DashboardRepositoryImpl,
} from "../../../../core/domain/dashboard/repositories/dashboard-repository";
import { useObservable } from "react-use";
import { useDailyIncomePosActions, useDailyIncomePosState } from "../stores/income-pos/daily-income-pos-store";
import Repository from "@/service-locator";

export default function DashboardIncomePos() {
	const repo = Repository.get<DashboardRepository>(DashboardRepositoryImpl, { instanceName: "Dashboard-Income-Pos" });

	const filter = useObservable(repo.selectedFilter$, repo.getSelectedFilter());

	const state = useDailyIncomePosState();
	const { fetch } = useDailyIncomePosActions();

	useEffect(() => {
		if (!filter) return;
		fetch(filter);
	}, [fetch, filter]);

	const categories = useMemo(() => state.list.map((d) => d.date), [state.list]);

	const series = useMemo(
		() => [
			{
				name: "Amount",
				data: state.list.map((d) => d.amount),
			},
		],
		[state.list],
	);

	const options: ApexCharts.ApexOptions = {
		chart: {
			type: "bar",
			height: 350,
			toolbar: { show: false },
			fontFamily: "inherit",
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: "55%",
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			width: 1,
			colors: ["#ff4d4f"],
		},
		legend: {
			show: true,
			showForSingleSeries: true,
			position: "top",
			horizontalAlign: "center",
			fontSize: "12px",
			labels: {
				colors: "#666",
			},
		},
		colors: ["#ffcccc"],
		fill: {
			type: "gradient",
			gradient: {
				shade: "light",
				type: "vertical",
				shadeIntensity: 0.25,
				inverseColors: false,
				opacityFrom: 0.9,
				opacityTo: 0.6,
				stops: [0, 100],
			},
		},
		grid: {
			show: true,
			borderColor: "#e5e7eb",
			strokeDashArray: 0,
			xaxis: {
				lines: { show: true },
			},
			yaxis: {
				lines: { show: true },
			},
		},
		xaxis: {
			categories,
			labels: {
				rotate: -45,
				rotateAlways: true,
				hideOverlappingLabels: false,
				style: {
					fontSize: "10px",
					colors: Array(Math.max(categories.length, 1)).fill("#999"),
				},
			},
			tickPlacement: "on",
			axisTicks: { show: false },
			axisBorder: { show: false },
		},
		yaxis: {
			labels: {
				style: { colors: "#999", fontSize: "10px" },
				formatter: (val) =>
					new Intl.NumberFormat("en-US", {
						maximumFractionDigits: 0,
					}).format(val),
			},
		},
		tooltip: {
			y: {
				formatter: (val) =>
					`${new Intl.NumberFormat("en-US", {
						maximumFractionDigits: 0,
					}).format(val)} ₺`,
			},
		},
	};

	if (isErrorState(state)) {
		return (
			<StyledChartWrapper className="flex h-[320px] items-center justify-center">
				<span className="text-sm text-red-500">{(state as ErrorState).error.message}</span>
			</StyledChartWrapper>
		);
	}

	return (
		<StyledChartWrapper className="-mx-3 -mb-3">
			<StyledReactApexChart options={options} series={series} type="bar" height={320} width="100%" />
		</StyledChartWrapper>
	);
}

//#region Styled Components
const StyledChartWrapper = styled.div`
  border-top: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[400], 0.4)};
`;
const StyledReactApexChart = styled(ReactApexChart)`
  .apexcharts-legend {
    display: flex;
    justify-content: center;
    padding-top: 8px;
  }

  .apexcharts-legend-series {
    display: flex !important;
    align-items: center;
    gap: 8px;
    margin: 0 8px !important;
  }

  .apexcharts-legend-marker svg {
    display: none;
  }

  .apexcharts-legend-marker {
    width: 60px !important;
    height: 16px !important;
    border-radius: 4px;
    position: relative;
  }

  .apexcharts-legend-text {
    font-size: 14px;
    font-weight: 500;
    color: #4b5563 !important; /* gray-600 */
  }

  .apexcharts-legend-series[rel="1"] .apexcharts-legend-marker {
    background: linear-gradient(to right, #fca5a5, #fee2e2);
    box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.6);
  }
`;
//#endregion
