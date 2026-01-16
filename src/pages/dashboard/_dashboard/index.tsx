import DashboardCard from "./components/card/dashboard-card";
import DashboardCustomerInfo from "./components/dashboard-customer-info";
import DashboardIncomePos from "./components/dashboard-income-pos";
import DashboardPerformance from "./components/dashboard-performance";
import DashboardDropdownMenu from "./components/dropdown-menu/dashboard-dropdown-menu";
import DashboardIncomeAccounting from "./components/dashboard-income-accounting";
import DropdownMenuPromise from "./components/promise/drop-down-menu-promise";
import { useEffect } from "react";
import Repository from "@/service-locator";

export default function Dashboard() {
	useEffect(() => {
		const stats = Repository.getStats();
		console.log("stats", stats);
	}, []);
	return (
		<div className="grid grid-cols-1 xl:grid-cols-2 gap-2 lg:gap-2">
			<DashboardCard title="Customer Info">
				<DashboardCustomerInfo />
			</DashboardCard>
			<DashboardCard title="Performance">
				<DashboardPerformance />
			</DashboardCard>
			<DashboardCard
				title="Daily Income (Pos)"
				subheader={
					<DropdownMenuPromise
						repoName="Dashboard-Income-Pos"
						builder={(items, repo) => <DashboardDropdownMenu items={items} repo={repo} />}
					/>
				}
			>
				<DashboardIncomePos />
			</DashboardCard>
			<DashboardCard
				title="Daily Income &amp; Expense (Accounting)"
				subheader={
					<DropdownMenuPromise
						repoName="Dashboard-Income-Accounting"
						builder={(items, repo) => <DashboardDropdownMenu items={items} repo={repo} />}
					/>
				}
			>
				<DashboardIncomeAccounting />
			</DashboardCard>
		</div>
	);
}
