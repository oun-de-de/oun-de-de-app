import { Icon } from "@/core/components/icon";
import { useTheme } from "@/core/theme/hooks/use-theme";
import { rgbAlpha } from "@/core/utils/theme";
import { Toaster } from "sonner";
import styled from "styled-components";

/**
 * https://sonner.emilkowal.ski/getting-started
 */
export default function Toast() {
	const { mode, themeTokens } = useTheme();

	return (
		<>
			<ToasterStyleWrapper
				themeTokens={themeTokens}
				position="top-right"
				theme={mode}
				closeButton
				toastOptions={{
					duration: 3000,
					classNames: {
						toast: "rounded-lg border-0",
						description: "text-xs text-current/45",
						content: "flex-1 ml-6",
						icon: "flex items-center justify-center rounded-lg",
						success: "bg-success/10",
						error: "bg-error/10",
						warning: "bg-warning/10",
						info: "bg-info/10",
					},
				}}
				icons={{
					success: (
						<div className="p-2 bg-success/10 rounded-lg">
							<Icon icon="carbon:checkmark-filled" size={24} color={themeTokens.color.palette.success.default} />
						</div>
					),
					error: (
						<div className="p-2 bg-error/10 rounded-lg">
							<Icon icon="carbon:warning-hex-filled" size={24} color={themeTokens.color.palette.error.default} />
						</div>
					),
					warning: (
						<div className="p-2 bg-warning/10 rounded-lg">
							<Icon icon="carbon:warning-alt-filled" size={24} color={themeTokens.color.palette.warning.default} />
						</div>
					),
					info: (
						<div className="p-2 bg-info/10 rounded-lg">
							<Icon icon="carbon:information-filled" size={24} color={themeTokens.color.palette.info.default} />
						</div>
					),
					loading: (
						<div className="p-2 bg-gray-400/10 text-gray-400 rounded-lg">
							<Icon icon="svg-spinners:6-dots-scale-middle" size={24} speed={3} />
						</div>
					),
				}}
				expand
			/>
		</>
	);
}

const ToasterStyleWrapper = styled(Toaster)<{ themeTokens: any }>`
  &[data-sonner-toast] {
    background-color: ${(p) => p.themeTokens.color.background.paper} !important;
    color: ${(p) => p.themeTokens.color.text.primary};
    font-weight: 600;
    font-size: 14px;

    [data-cancel] {
      color: ${(p) => p.themeTokens.color.text.primary};
      background-color: transparent;
      &:hover {
        background-color: ${(p) => rgbAlpha(p.themeTokens.color.text.primary, 0.08)};
      }
    }

    /* Default */
    [data-action] {
      color: ${(p) => p.themeTokens.color.palette.primary.default};
      background-color: transparent;
      &:hover {
        background-color: ${(p) => rgbAlpha(p.themeTokens.color.palette.primary.default, 0.08)};
      }
    }

    /* Info */
    &[data-type="info"] [data-action] {
      color: ${(p) => p.themeTokens.color.palette.info.default};
      background-color: transparent;
      &:hover {
        background-color: ${(p) => rgbAlpha(p.themeTokens.color.palette.info.default, 0.08)};
      }
    }

    /* Error */
    &[data-type="error"] [data-action] {
      color: ${(p) => p.themeTokens.color.palette.error.default};
      background-color: transparent;
      &:hover {
        background-color: ${(p) => rgbAlpha(p.themeTokens.color.palette.error.default, 0.08)};
      }
    }

    /* Success */
    &[data-type="success"] [data-action] {
      color: ${(p) => p.themeTokens.color.palette.success.default};
      background-color: transparent;
      &:hover {
        background-color: ${(p) => rgbAlpha(p.themeTokens.color.palette.success.default, 0.08)};
      }
    }

    /* Warning */
    &[data-type="warning"] [data-action] {
      color: ${(p) => p.themeTokens.color.palette.warning.default};
      background-color: transparent;
      &:hover {
        background-color: ${(p) => rgbAlpha(p.themeTokens.color.palette.warning.default, 0.08)};
      }
    }

    /* Loading */
    &[data-type="loading"] [data-icon] .sonner-loader[data-visible="true"] {
      margin-left: 12px;
    }

    /* Close Button */
    [data-close-button] {
      top: 0;
      right: 0;
      left: auto;
      border-width: 1px;
      border-style: dashed;
      background-color: ${(p) => p.themeTokens.color.background.paper};
      border: 1px solid ${(p) => rgbAlpha(p.themeTokens.color.palette.gray[200], 0.2)};
    }
  }
`;
