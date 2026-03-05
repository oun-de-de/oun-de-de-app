import { useState } from "react";
import Icon from "@/core/components/icon/icon";
import { Button } from "@/core/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/core/ui/dropdown-menu";
import type { ReportTemplateColumn } from "@/pages/dashboard/reports/components/layout/report-template-table";
import type { ReportSectionVisibility } from "@/pages/dashboard/reports/components/layout/report-toolbar";
import { ReportToolbar } from "../../../reports/components/layout/report-toolbar";
import {
	PAPER_SIZE_LABELS,
	type PaperSizeMode,
	SORT_LABELS,
	type SortMode,
	TEMPLATE_LABELS,
	type TemplateMode,
} from "../constants";

const toolbarButtonClassName = "h-8 gap-1.5 px-2 text-sky-600 hover:bg-sky-50";

type ExportPreviewToolbarProps = {
	showSections: ReportSectionVisibility;
	onShowSectionsChange: (sections: ReportSectionVisibility) => void;
	templateMode: TemplateMode;
	onTemplateModeChange: (mode: TemplateMode) => void;
	paperSizeMode: PaperSizeMode;
	onPaperSizeModeChange: (mode: PaperSizeMode) => void;
	sortMode: SortMode;
	onSortModeChange: (mode: SortMode) => void;
	columns: ReportTemplateColumn[];
	columnVisibility: Record<string, boolean>;
	onColumnVisibilityChange: (columnId: string, checked: boolean) => void;
	onExport: () => void;
	onPrint: () => void;
	onCopy: () => void;
	isExporting: boolean;
	isExportDisabled: boolean;
};

export function ExportPreviewToolbar({
	showSections,
	onShowSectionsChange,
	templateMode,
	onTemplateModeChange,
	paperSizeMode,
	onPaperSizeModeChange,
	sortMode,
	onSortModeChange,
	columns,
	columnVisibility,
	onColumnVisibilityChange,
	onExport,
	onPrint,
	onCopy,
	isExporting,
	isExportDisabled,
}: ExportPreviewToolbarProps) {
	const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

	return (
		<div className="flex flex-col">
			<ReportToolbar
				className="rounded-b-none border-b-0"
				showSections={showSections}
				onShowSectionsChange={onShowSectionsChange}
				leftActions={
					<div className="flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild className="border-none">
								<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
									<Icon icon="mdi:view-dashboard-outline" size="1.2em" />
									<span className="text-xs font-medium">Layout</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-48">
								<DropdownMenuCheckboxItem
									checked={showSections.header}
									onCheckedChange={(checked) => onShowSectionsChange({ ...showSections, header: !!checked })}
								>
									Header
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showSections.footer}
									onCheckedChange={(checked) => onShowSectionsChange({ ...showSections, footer: !!checked })}
								>
									Footer
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showSections.timestamp}
									onCheckedChange={(checked) => onShowSectionsChange({ ...showSections, timestamp: !!checked })}
								>
									Timestamp
								</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem
									checked={showSections.signature}
									onCheckedChange={(checked) => onShowSectionsChange({ ...showSections, signature: !!checked })}
								>
									Signature
								</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild className="border-none">
								<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
									<Icon icon="mdi:card-text-outline" size="1.2em" />
									<span className="text-xs font-medium">Style: {TEMPLATE_LABELS[templateMode]}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-44">
								{(Object.keys(TEMPLATE_LABELS) as TemplateMode[]).map((mode) => (
									<DropdownMenuItem key={mode} onClick={() => onTemplateModeChange(mode)}>
										<Icon icon={templateMode === mode ? "mdi:radiobox-marked" : "mdi:radiobox-blank"} size="1em" />
										{TEMPLATE_LABELS[mode]}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild className="border-none">
								<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
									<Icon icon="mdi:crop-portrait" size="1.2em" />
									<span className="text-xs font-medium">Paper: {PAPER_SIZE_LABELS[paperSizeMode]}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-40">
								{(Object.keys(PAPER_SIZE_LABELS) as PaperSizeMode[]).map((mode) => (
									<DropdownMenuItem key={mode} onClick={() => onPaperSizeModeChange(mode)}>
										<Icon icon={paperSizeMode === mode ? "mdi:radiobox-marked" : "mdi:radiobox-blank"} size="1em" />
										{PAPER_SIZE_LABELS[mode]}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild className="border-none">
								<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
									<Icon icon="mdi:view-column-outline" size="1.2em" />
									<span className="text-xs font-medium">Fields</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-52">
								{columns.map((column) => (
									<DropdownMenuCheckboxItem
										key={column.id}
										checked={columnVisibility[column.id] !== false}
										onCheckedChange={(checked) => onColumnVisibilityChange(column.id, !!checked)}
									>
										{typeof column.header === "string" ? column.header : column.id}
									</DropdownMenuCheckboxItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>

						<DropdownMenu>
							<DropdownMenuTrigger asChild className="border-none">
								<Button variant="ghost" size="sm" className={toolbarButtonClassName}>
									<Icon icon="mdi:sort-variant" size="1.2em" />
									<span className="text-xs font-medium">Sort: {SORT_LABELS[sortMode]}</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-52">
								{(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
									<DropdownMenuItem key={mode} onClick={() => onSortModeChange(mode)}>
										<Icon icon={sortMode === mode ? "mdi:radiobox-marked" : "mdi:radiobox-blank"} size="1em" />
										{SORT_LABELS[mode]}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				}
				rightActions={
					<div className="flex items-center gap-2">
						<Button
							variant={isCustomizeOpen ? "secondary" : "ghost"}
							size="sm"
							className={toolbarButtonClassName}
							onClick={() => setIsCustomizeOpen((prev) => !prev)}
						>
							<Icon icon="mdi:cog-outline" size="1.2em" />
							<span className="text-xs font-medium">Customize</span>
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className={toolbarButtonClassName}
							onClick={onExport}
							disabled={isExportDisabled}
						>
							<Icon icon="mdi:file-excel-outline" size="1.2em" />
							<span className="text-xs font-medium">{isExporting ? "Exporting..." : "Export Excel"}</span>
						</Button>
						<Button variant="ghost" size="sm" type="button" className={toolbarButtonClassName} onClick={onPrint}>
							<Icon icon="mdi:printer-outline" size="1.2em" />
							<span className="text-xs font-medium">Print</span>
						</Button>
						<Button variant="ghost" size="sm" className={toolbarButtonClassName} onClick={onCopy}>
							<Icon icon="mdi:content-copy" size="1.2em" />
							<span className="text-xs font-medium">Copy</span>
						</Button>
					</div>
				}
			/>

			{isCustomizeOpen && (
				<div className="rounded-b-md border border-t-0 bg-white px-4 py-3 print:hidden">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						<div className="space-y-2">
							<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Show</div>
							<div className="flex flex-wrap gap-2">
								<Button
									variant={showSections.header ? "secondary" : "outline"}
									size="sm"
									onClick={() => onShowSectionsChange({ ...showSections, header: !showSections.header })}
								>
									Header
								</Button>
								<Button
									variant={showSections.footer ? "secondary" : "outline"}
									size="sm"
									onClick={() => onShowSectionsChange({ ...showSections, footer: !showSections.footer })}
								>
									Footer
								</Button>
								<Button
									variant={showSections.timestamp ? "secondary" : "outline"}
									size="sm"
									onClick={() => onShowSectionsChange({ ...showSections, timestamp: !showSections.timestamp })}
								>
									Timestamp
								</Button>
								<Button
									variant={showSections.signature ? "secondary" : "outline"}
									size="sm"
									onClick={() => onShowSectionsChange({ ...showSections, signature: !showSections.signature })}
								>
									Signature
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Template</div>
							<div className="flex flex-wrap gap-2">
								{(Object.keys(TEMPLATE_LABELS) as TemplateMode[]).map((mode) => (
									<Button
										key={mode}
										variant={templateMode === mode ? "secondary" : "outline"}
										size="sm"
										onClick={() => onTemplateModeChange(mode)}
									>
										{TEMPLATE_LABELS[mode]}
									</Button>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paper Size</div>
							<div className="flex flex-wrap gap-2">
								{(Object.keys(PAPER_SIZE_LABELS) as PaperSizeMode[]).map((mode) => (
									<Button
										key={mode}
										variant={paperSizeMode === mode ? "secondary" : "outline"}
										size="sm"
										onClick={() => onPaperSizeModeChange(mode)}
									>
										{PAPER_SIZE_LABELS[mode]}
									</Button>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</div>
							<div className="flex flex-wrap gap-2">
								{(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
									<Button
										key={mode}
										variant={sortMode === mode ? "secondary" : "outline"}
										size="sm"
										onClick={() => onSortModeChange(mode)}
									>
										{SORT_LABELS[mode]}
									</Button>
								))}
							</div>
						</div>
					</div>

					<div className="mt-4 space-y-2">
						<div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Columns</div>
						<div className="flex flex-wrap gap-2">
							{columns.map((column) => {
								const checked = columnVisibility[column.id] !== false;
								return (
									<Button
										key={column.id}
										variant={checked ? "secondary" : "outline"}
										size="sm"
										onClick={() => onColumnVisibilityChange(column.id, !checked)}
									>
										{typeof column.header === "string" ? column.header : column.id}
									</Button>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
