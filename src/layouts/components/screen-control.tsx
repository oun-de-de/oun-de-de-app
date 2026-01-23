import { Icon } from "@/core/components/icon";
import { Button } from "@/core/ui/button";
import { useState, useEffect } from "react";
import styled from "styled-components";

export default function ScreenControl() {
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(!!document.fullscreenElement);
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	}, []);

	const toggleFullscreen = async () => {
		try {
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
		} catch (err) {
			console.error("Error toggling fullscreen:", err);
		}
	};

	return (
		<div className="flex items-center gap-1">
			<StyledButton
				variant="ghost"
				size="icon"
				className="rounded-full"
				onClick={toggleFullscreen}
				title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
			>
				<Icon icon={isFullscreen ? "solar:quit-full-screen-outline" : "solar:full-screen-outline"} size={24} />
			</StyledButton>
		</div>
	);
}

//#region Styled Components
const StyledButton = styled(Button)`
	color: ${({ theme }) => theme.colors.common.black};
	svg {
		fill: ${({ theme }) => theme.colors.palette.gray[500]};
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.action.hover};
	}
`;
//#endregion
