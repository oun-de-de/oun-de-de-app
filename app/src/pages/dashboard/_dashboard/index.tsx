import { useState } from "react";
import DashboardCard from "./presentation/components/card/dashboard-card";
import DashboardCustomerInfo from "./presentation/components/dashboard-customer-info";
import DashboardIncomePos from "./presentation/components/dashboard-income-pos";
import DashboardPerformance from "./presentation/components/dashboard-performance";
import DashboardDropdownMenu from "./presentation/components/dropdown-menu/dashboard-dropdown-menu";

export default function Dashboard() {
	const [incomePos, setIncomePos] = useState<"7" | "15" | "30">("30");

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
					<DashboardDropdownMenu
						value={incomePos}
						onChange={(value) => setIncomePos(value as "7" | "15" | "30")}
						options={[
							{ id: "7", label: "Last 7 Days" },
							{ id: "15", label: "Last 15 Days" },
							{ id: "30", label: "Last 30 Days" },
						]}
					/>
				}
			> 
				<DashboardIncomePos filterRange={incomePos}/>
			</DashboardCard>
			<DashboardCard title="Daily Income &amp; Expense (Accounting)" />
		</div>
	);
}