import { useEffect, useState } from "react";
import type { HighlighterGeneric } from "shiki";
import type { BundledLanguage, BundledTheme } from "shiki/bundle/web";
import { Icon } from "@/core/components/icon";
import { useCopyToClipboard } from "@/core/hooks";
import { useSettings } from "@/core/store/settingStore";
import { Button } from "@/core/ui/button";
import { cn } from "@/core/utils";
import type { HighlightCodeProps } from ".";

let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | undefined;

function getHighlighter() {
	highlighterPromise ??= import("shiki/bundle/web").then(({ createHighlighter }) =>
		createHighlighter({
			langs: ["javascript", "typescript", "jsx", "tsx"],
			themes: ["min-dark", "snazzy-light"],
		}),
	);
	return highlighterPromise;
}

export function HighlightCode({ code, options, className, withCopy = true }: HighlightCodeProps) {
	const { copyFn } = useCopyToClipboard();
	const [html, setHtml] = useState<string>();
	const { themeMode } = useSettings();

	useEffect(() => {
		let isCurrent = true;

		getHighlighter().then((highlighter) => {
			if (!isCurrent) return;

			setHtml(
				highlighter.codeToHtml(code, {
					lang: options?.lang || "typescript",
					theme: options?.theme || (themeMode === "dark" ? "min-dark" : "snazzy-light"),
					transformers: [
						{
							pre(node) {
								this.addClassToHast(node, "p-3 rounded-md");
							},
						},
					],
					...options,
				}),
			);
		});

		return () => {
			isCurrent = false;
		};
	}, [code, options, themeMode]);

	return (
		<div className={cn("w-full relative group", className)}>
			{withCopy && (
				<Button
					variant="outline"
					size="icon"
					className="absolute top-2 right-2 bg-accent opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
					onClick={() => copyFn(code)}
				>
					<Icon icon="eva:copy-fill" size={24} />
				</Button>
			)}
			{html ? (
				<div
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki returns escaped HTML for highlighted code.
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			) : (
				<pre className="p-3 rounded-md overflow-auto">
					<code>{code}</code>
				</pre>
			)}
		</div>
	);
}
