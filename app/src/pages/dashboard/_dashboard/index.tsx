import DashboardCard from "./presentation/components/card/dashboard-card";
import DashboardCustomerInfo from "./presentation/components/dashboard-customer-info";
import DashboardIncomePos from "./presentation/components/dashboard-income-pos";
import DashboardPerformance from "./presentation/components/dashboard-performance";
import DashboardDropdownMenu from "./presentation/components/dropdown-menu/dashboard-dropdown-menu";
import { DashboardRepository, DashboardRepositoryImpl } from "./domain/repositories/dashboard-repository";
import { MultiProvider, register, useProvider } from "@/ui/multi-provider";
import { DashboardApiImpl } from "@/api/services/dashboardService";
import DashboardIncomeAccounting from "./presentation/components/dashboard-income-accounting";
import DropdownMenuPromise from "./presentation/components/promise/drop-down-menu-promise";

export default function Dashboard() {
	return (
		<MultiProvider
			repos={[
				register<DashboardRepository>(() =>
				  new DashboardRepositoryImpl(new DashboardApiImpl(), "dashboard:selectedFilter:income-pos"),
				  "Income-Pos"
				),
				register<DashboardRepository>(() =>
				  new DashboardRepositoryImpl(new DashboardApiImpl(), "dashboard:selectedFilter:income-accounting"),
				  "Income-Accounting"
				),
			]}
		>
			<View />
		</MultiProvider>
	)
}

function View() {
	const repoPos = useProvider<DashboardRepository>("Income-Pos");
	const repoAccounting = useProvider<DashboardRepository>("Income-Accounting");
	
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
					<DropdownMenuPromise repo={repoPos} builder={(items, repo) => <DashboardDropdownMenu items={items} repo={repo} />} />
				  }
			> 
				<DashboardIncomePos/>
			</DashboardCard>
			<DashboardCard title="Daily Income &amp; Expense (Accounting)" 
				subheader={
					<DropdownMenuPromise repo={repoAccounting} builder={(items, repo) => <DashboardDropdownMenu items={items} repo={repo} />} />
				  }
			>
				<DashboardIncomeAccounting />
			</DashboardCard>
		</div>
	);
}