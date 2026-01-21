import apiClient from "../apiClient";
// import { UserApi } from "./userService";

/**
 * Password management API endpoints
 */
export enum PasswordApi {
	ChangePassword = "/user/change-password",
	ResetPassword = "/user/reset-password",
	ForgotPassword = "/user/forgot-password",
}

/**
 * Request/Response types for password operations
 */
export interface ChangePasswordReq {
	oldPassword: string;
	newPassword: string;
}

export interface ResetPasswordReq {
	token: string;
	newPassword: string;
}

export interface ForgotPasswordReq {
	email: string;
}

/**
 * Password service API methods
 */
const changePassword = (data: ChangePasswordReq) => apiClient.post({ url: PasswordApi.ChangePassword, data });

const resetPassword = (data: ResetPasswordReq) => apiClient.post({ url: PasswordApi.ResetPassword, data });

const forgotPassword = (data: ForgotPasswordReq) => apiClient.post({ url: PasswordApi.ForgotPassword, data });

export default {
	changePassword,
	resetPassword,
	forgotPassword,
};
