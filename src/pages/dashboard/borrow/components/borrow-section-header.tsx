import type { ElementType } from "react";

export const SectionHeader = ({ icon: Icon, title }: { icon?: ElementType; title: string }) => (
	<div className="flex items-center gap-2 mb-4">
		{Icon && <Icon className="w-4 h-4 text-gray-400" />}
		<h3 className="text-sm font-bold text-gray-700">{title}</h3>
	</div>
);
