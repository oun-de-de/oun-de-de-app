import { rgbAlpha } from "@/utils/theme";
import { useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { styled } from "styled-components";
import {
  useDashboardIncomePosActions,
  useDailyIncomePosState,
} from "@/pages/dashboard/_dashboard/presentation/stores/income-pos/daily-income-pos-store";
import { DailyIncomePosType } from "../stores/income-pos/daily-income-pos-state";
import { Skeleton } from "@/ui/skeleton";
import { DailyIncomePosLoadFirstErrorState } from "../stores/income-pos/states/get-state";

export default function DashboardIncomePos({ filterRange }: { filterRange: "7" | "15" | "30" }) {
  const state = useDailyIncomePosState();
  const { fetch, init } = useDashboardIncomePosActions();

  useEffect(() => {
    init(filterRange);
  }, []);

  useEffect(() => {
    fetch(filterRange);
  }, [fetch, filterRange]);

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

  if (state.type == DailyIncomePosType.GetListLoading && !state.list.length) {
    return (
      <Skeleton className="h-[320px] w-full" />
    );
  }

  if (state.type == DailyIncomePosType.GetListError) {
    const errorState = state as DailyIncomePosLoadFirstErrorState;
    return (
      <StyledChartWrapper className="flex h-[320px] items-center justify-center">
        <span className="text-sm text-red-500">{errorState.error.message}</span>
      </StyledChartWrapper>
    );
  }

  return (
    <StyledChartWrapper className="-mx-3 -mb-3">
      <div className="flex items-center justify-center gap-2 pt-2">
        <div
          className="
            h-4 w-15 rounded-sm
            bg-gradient-to-r
            from-red-300
            to-red-100
            ring-1 ring-red-400/60
          "
        />
        <span className="text-sm font-medium text-gray-600">Amount</span>
      </div>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={320}
        width="100%"
      />
    </StyledChartWrapper>
  );
}

//#region Styled Components
const StyledChartWrapper = styled.div`
  border-top: 1px solid ${({ theme }) => rgbAlpha(theme.colors.palette.gray[400], 0.4)};
`;
//#endregion