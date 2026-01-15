import DashboardCard from "./presentation/components/card/dashboard-card";
import DashboardCustomerInfo from "./presentation/components/dashboard-customer-info";
import DashboardIncomePos from "./presentation/components/dashboard-income-pos";
import DashboardPerformance from "./presentation/components/dashboard-performance";
import DashboardDropdownMenu from "./presentation/components/dropdown-menu/dashboard-dropdown-menu";
import { DashboardRepository, DashboardRepositoryImpl } from "./domain/repositories/dashboard-repository";
import { MultiProvider, register } from "@/ui/multi-provider";

export default function Dashboard() {
	return (
		<MultiProvider
			repos={[
				register<DashboardRepository>(() =>
				  new DashboardRepositoryImpl()
				),
			]}
			>
			<View />
		</MultiProvider>
	)
}

function View() {
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
					<DashboardDropdownMenu />
				  }
			> 
				<DashboardIncomePos/>
			</DashboardCard>
			<DashboardCard title="Daily Income &amp; Expense (Accounting)" />
		</div>
	);
}