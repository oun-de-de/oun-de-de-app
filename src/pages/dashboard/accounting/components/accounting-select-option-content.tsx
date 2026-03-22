type AccountingSelectOptionContentProps = {
	primary: string;
	secondary: string;
	rightPaddingClassName?: string;
};

export function AccountingSelectOptionContent({
	primary,
	secondary,
	rightPaddingClassName = "pr-24",
}: AccountingSelectOptionContentProps) {
	return (
		<div className={`block w-full min-w-0 ${rightPaddingClassName}`}>
			<div className="truncate">{primary}</div>
			<div className="pointer-events-none absolute inset-y-0 right-8 flex items-center whitespace-nowrap text-right text-xs text-slate-500">
				{secondary}
			</div>
		</div>
	);
}
