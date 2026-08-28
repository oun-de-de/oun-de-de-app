import type { Customer } from "@/core/types/customer";
import { Avatar, AvatarFallback, AvatarImage } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";

export function getSafeAvatarImageUrl(value?: string | null): string | undefined {
	const trimmedValue = value?.trim();
	if (!trimmedValue) return undefined;

	try {
		const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost";
		const url = new URL(trimmedValue, baseUrl);
		return url.protocol === "http:" || url.protocol === "https:" ? trimmedValue : undefined;
	} catch {
		return undefined;
	}
}

export function CustomerProfileCard({ customer }: { customer: Customer }) {
	const safeProfileUrl = getSafeAvatarImageUrl(customer.profileUrl);

	return (
		<div className="flex items-start gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
			<Avatar className="h-20 w-20 border-2 border-slate-100 shadow-sm">
				<AvatarImage src={safeProfileUrl} alt={customer.name} className="object-cover" />
				<AvatarFallback className="bg-slate-50 text-xl font-semibold text-slate-400">
					{customer.name.substring(0, 2).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			<div className="flex flex-1 flex-col gap-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<h3 className="text-xl font-bold text-slate-900">{customer.name}</h3>
						{customer.code && (
							<Badge
								variant="outline"
								className="border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700"
							>
								{customer.code}
							</Badge>
						)}
					</div>
					<Badge variant={customer.status ? "success" : "error"} className="capitalize">
						{customer.status ? "Active" : "Inactive"}
					</Badge>
				</div>
				<div className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
					{customer.telephone && (
						<div className="flex items-center gap-2">
							<span className="shrink-0 font-medium text-slate-400">Phone:</span>
							<span className="text-slate-700">{customer.telephone}</span>
						</div>
					)}
					{customer.email && (
						<div className="flex items-center gap-2">
							<span className="shrink-0 font-medium text-slate-400">Email:</span>
							<span className="truncate text-slate-700" title={customer.email}>
								{customer.email}
							</span>
						</div>
					)}
					{customer.address && (
						<div className="flex items-center gap-2">
							<span className="shrink-0 font-medium text-slate-400">Address:</span>
							<span className="truncate text-slate-700" title={customer.address}>
								{customer.address}
							</span>
						</div>
					)}
				</div>
				<div className="mt-2 flex flex-wrap gap-6 border-t border-slate-100 pt-3">
					{customer.depositBalance !== undefined && (
						<Metric label="Deposit Balance" value={customer.depositBalance} color="text-emerald-600" />
					)}
					{customer.creditLimit !== undefined && (
						<Metric label="Credit Limit" value={customer.creditLimit} color="text-amber-600" />
					)}
					{customer.invoiceCount !== undefined && <Metric label="Invoices" value={customer.invoiceCount} />}
				</div>
			</div>
		</div>
	);
}

//
function Metric({ label, value, color = "text-slate-700" }: { label: string; value: number; color?: string }) {
	const displayValue =
		label === "Invoices" ? value : value.toLocaleString(undefined, { style: "currency", currency: "USD" });
	return (
		<div className="flex flex-col">
			<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
			<span className={`text-base font-bold ${color}`}>{displayValue}</span>
		</div>
	);
}
