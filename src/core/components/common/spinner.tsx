import styled, { keyframes } from "styled-components";
import React from "react";

export interface SpinnerProps {
	size?: number;
	color?: string;
	className?: string;
	style?: React.CSSProperties;
	label?: string;
}

export function Spinner({ size = 18, color = "#888", className, style, label = "Loading" }: SpinnerProps) {
	return (
		<SpinnerWrapper className={className} style={{ width: "auto", height: size, ...style }}>
			<SpinnerCircle size={size} color={color} />
			<span style={{ marginLeft: 10, fontSize: size * 0.8, color }}>{label}</span>
		</SpinnerWrapper>
	);
}

const spin = keyframes`
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const SpinnerCircle = styled.span<{ size: number; color: string }>`
  display: block;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border: 3px solid ${({ color }) => color};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
`;
