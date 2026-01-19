import { useEffect } from "react";
import {
	DashboardRepository,
	DashboardRepositoryImpl,
} from "../../../../core/domain/dashboard/repositories/dashboard-repository";
import { useObservable } from "react-use";
import { ErrorState, isErrorState } from "@/core/types/state";
import ReactApexChart from "react-apexcharts";
import { styled } from "styled-components";
import { rgbAlpha } from "@/core/utils/theme";
import Repository from "@/service-locator";
import { useStore } from "@/core/ui/store/multi-store-provider";
import { DailyIncomeAccountingStore } from "../stores/income-accounting/daily-income-accounting-store";
import { StoreBuilder } from "@/core/ui/store/store-builder";

export default function DashboardIncomeAccounting() {
	const repo = Repository.get<DashboardRepository>(DashboardRepositoryImpl, {
		instanceName: "Dashboard-Income-Accounting",
	});

	const filter = useObservable(repo.selectedFilter$, repo.getSelectedFilter());

	const store = useStore<DailyIncomeAccountingStore>("dailyIncomeAccounting");
	const { fetch } = store.useAction();

	useEffect(() => {
		if (!filter) return;
		fetch(filter);
	}, [fetch, filter]);

	return (
		<StoreBuilder<DailyIncomeAccountingStore>
			store={store}
			builder={(state) => {
				if (isErrorState(state)) {
					return (
						<StyledChartWrapper className="flex h-[320px] items-center justify-center">
							<span className="text-sm text-red-500">{(state as ErrorState).error.message}</span>
						</StyledChartWrapper>
					);
				}

				const categories = state.list.map((d) => d.date);
				const series = [
					{
						name: "Income",
						data: state.list.map((d) => d.income),
					},
					{
						name: "Expense",
						data: state.list.map((d) => d.expense),
					},
				];

				const options: ApexCharts.ApexOptions = {
					chart: {
						type: "area",
						height: 350,
						toolbar: { show: false },
						fontFamily: "inherit",
					},

					stroke: {
						curve: "smooth",
						width: 2,
					},

					markers: {
						size: 4,
						strokeWidth: 0,
						hover: { size: 6 },
					},

					colors: ["#22d3ee", "#ff4d4f"],

					fill: {
						type: "gradient",
						gradient: {
							shade: "light",
							type: "vertical",
							shadeIntensity: 0.2,
							opacityFrom: 0.45,
							opacityTo: 0.05,
							stops: [0, 100],
						},
					},

					dataLabels: {
						enabled: false,
					},

					legend: {
						show: true,
						position: "top",
						horizontalAlign: "center",
						fontSize: "12px",
						labels: {
							colors: "#666",
						},
					},

					grid: {
						show: true,
						borderColor: "#e5e7eb",
						xaxis: { lines: { show: true } },
						yaxis: { lines: { show: true } },
					},

					xaxis: {
						categories,
						labels: {
							rotate: -45,
							style: {
								fontSize: "10px",
								colors: Array(Math.max(categories.length, 1)).fill("#999"),
							},
						},
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

				return (
					<StyledChartWrapper className="-mx-3 -mb-3">
						<StyledReactApexChart options={options} series={series} type="area" height={320} width="100%" />
					</StyledChartWrapper>
				);
			}}
		/>
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

  /* Ẩn SVG marker mặc định */
  .apexcharts-legend-marker svg {
    display: none;
  }

  /* Marker thành “thanh màu” */
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

  /* Income */
  .apexcharts-legend-series[rel="1"] .apexcharts-legend-marker {
    background: linear-gradient(to right, #22d3ee, #a5f3fc);
    box-shadow: 0 0 0 1px rgba(34, 211, 238, 0.6);
  }

  /* Expense */
  .apexcharts-legend-series[rel="2"] .apexcharts-legend-marker {
    background: linear-gradient(to right, #fca5a5, #fee2e2);
    box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.6);
  }
`;
////#endregion
