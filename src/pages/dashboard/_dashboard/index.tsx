import DashboardCard from "./components/card/dashboard-card";
import DashboardCustomerInfo from "./components/dashboard-customer-info";
import DashboardIncomePos from "./components/dashboard-income-pos";
import DashboardPerformance from "./components/dashboard-performance";
import DashboardSelect from "./components/select/dashboard-select";
import DashboardIncomeAccounting from "./components/dashboard-income-accounting";
import DropdownMenuPromise from "./components/promise/drop-down-menu-promise";
import { DashboardProviders } from "./dashboard-providers";

export default function Dashboard() {
	return (
		<DashboardProviders>
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-2 lg:gap-2">
				<DashboardCard title="Financial Overview">
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
							builder={(items, repo) => <DashboardSelect items={items} repo={repo} />}
						/>
					}
				>
					<DashboardIncomePos />
				</DashboardCard>
				<DashboardCard
					title="Daily Report"
					subheader={
						<DropdownMenuPromise
							repoName="Dashboard-Income-Accounting"
							builder={(items, repo) => <DashboardSelect items={items} repo={repo} />}
						/>
					}
				>
					<DashboardIncomeAccounting />
				</DashboardCard>
			</div>
		</DashboardProviders>
	);
}
