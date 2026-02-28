import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import customerService from "@/core/api/services/customer-service";
import Icon from "@/core/components/icon/icon";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { Separator } from "@/core/ui/separator";
import { Text } from "@/core/ui/typography";
import { useRouter } from "@/routes/hooks/use-router";
import { InstallmentsTable } from "./components/installments-table";
import { useBorrowDetail } from "./hooks/use-borrow-detail";

export default function BorrowDetailPage() {
	const { id } = useParams<{ id: string }>();
	const router = useRouter();

	const { loan, isLoading, isError, installments, payInstallment, isPaying } = useBorrowDetail(id || "");
	const { data: borrower } = useQuery({
		queryKey: ["loan-borrower", loan?.borrowerType, loan?.borrowerId],
		queryFn: () => customerService.getCustomer(loan?.borrowerId ?? ""),
		enabled: !!loan?.borrowerId && loan?.borrowerType === "customer",
	});

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Text variant="body1">Loading...</Text>
			</div>
		);
	}

	if (isError || !loan) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<Text variant="body1" className="mb-4 text-lg font-semibold">
						Loan not found
					</Text>
					<Button onClick={() => router.push("/dashboard/borrow")}>
						<Icon icon="mdi:arrow-left" className="mr-2" />
						Back to Loans
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-2 md:gap-4 p-2 md:p-4">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-2">
					<Button size="sm" variant="outline" onClick={() => router.push("/dashboard/borrow")}>
						<Icon icon="mdi:arrow-left" />
					</Button>
					<Button size="sm" className="gap-1 pointer-events-none">
						Loan Details
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
				{/* Loan Info Panel */}
				<div className="col-span-1 rounded-lg border bg-white p-6 shadow-sm flex flex-col gap-4">
					<Text variant="subTitle1" className="font-semibold border-b pb-2">
						Information
					</Text>
					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<Text variant="body2" className="text-slate-500">
								Borrower
							</Text>
							<div className="text-right flex gap-2">
								<Text variant="body2" className="font-medium">
									{borrower?.name || loan.borrowerId.slice(0, 10)}
								</Text>
								<span className="text-slate-400">-</span>
								<Badge variant={loan.borrowerType === "employee" ? "info" : "success"} className="capitalize">
									{loan.borrowerType}
								</Badge>
							</div>
						</div>
						<Separator />
						<div className="flex justify-between items-center">
							<Text variant="body2" className="text-slate-500">
								Principal Amount
							</Text>
							<Text variant="body2" className="font-medium">
								{loan.principalAmount.toLocaleString()} KHR
							</Text>
						</div>
						<Separator />
						<div className="flex justify-between items-center">
							<Text variant="body2" className="text-slate-500">
								Term (Months)
							</Text>
							<Text variant="body2" className="font-medium">
								{loan.termMonths}
							</Text>
						</div>
						<Separator />
						<div className="flex justify-between items-center">
							<Text variant="body2" className="text-slate-500">
								Start Date
							</Text>
							<Text variant="body2" className="font-medium">
								{new Date(loan.startDate).toLocaleDateString()}
							</Text>
						</div>
						<Separator />
						<div className="flex justify-between items-center">
							<Text variant="body2" className="text-slate-500">
								Created At
							</Text>
							<Text variant="body2" className="font-medium">
								{new Date(loan.createdAt).toLocaleDateString()}
							</Text>
						</div>
					</div>
				</div>

				{/* Installments Panel */}
				<div className="col-span-1 lg:col-span-2 rounded-lg border bg-white p-6 shadow-sm flex flex-col">
					<Text variant="subTitle1" className="font-semibold mb-4">
						Installments
					</Text>
					<InstallmentsTable installments={installments} onPay={payInstallment} isPayPending={isPaying} />
				</div>
			</div>
		</div>
	);
}
