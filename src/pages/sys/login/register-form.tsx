import userService from "@/core/api/services/userService";
import { Button } from "@/core/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/core/ui/form";
import { Input } from "@/core/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ReturnButton } from "./components/ReturnButton";
import { LoginStateEnum, useLoginStateContext } from "./providers/login-provider";
import { toast } from "sonner";

function RegisterForm() {
	const { t } = useTranslation();
	const { loginState, backToLogin } = useLoginStateContext();

	const signUpMutation = useMutation({
		mutationFn: userService.signup,
	});

	const form = useForm({
		defaultValues: {
			username: "",
			// email: "",
			password: "",
			reEnteredPassword: "",
		},
	});

	const onFinish = async (values: any) => {
		const res = await signUpMutation.mutateAsync(values);
		if (res) {
			toast.success("Signed up successfully");
		}
		backToLogin();
	};

	if (loginState !== LoginStateEnum.REGISTER) return null;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onFinish)} className="space-y-4">
				<div className="flex flex-col items-center gap-2 text-center">
					<h1 className="text-2xl font-bold">{t("sys.login.signUpFormTitle")}</h1>
				</div>

				<FormField
					control={form.control}
					name="username"
					rules={{
						required: t("sys.login.accountPlaceholder"),
						validate: {
							length: (value) => (value.length >= 8 && value.length <= 36) || "Username must be 8–36 characters",
							startsWithLetter: (value) => /^[a-zA-Z]/.test(value) || "Username must start with a letter",
							validCharacters: (value) =>
								/^[a-zA-Z][a-zA-Z0-9_.]*$/.test(value) || "Username can only contain letters, numbers, '_' or '.'",
						},
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									id="register-username"
									autoComplete="username"
									placeholder={t("sys.login.userName")}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* <FormField
					control={form.control}
					name="email"
					rules={{ required: t("sys.login.emaildPlaceholder") }}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									id="register-email"
									type="email"
									autoComplete="email"
									placeholder={t("sys.login.email")}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/> */}

				<FormField
					control={form.control}
					name="password"
					rules={{
						required: t("sys.login.passwordPlaceholder"),
						validate: {
							// minLength: (value) => value.length >= 8 || "Password must be at least 8 characters long",
							// hasUppercase: (value) => /[A-Z]/.test(value) || "Password must include at least one uppercase letter",
							// hasLowercase: (value) => /[a-z]/.test(value) || "Password must include at least one lowercase letter",
							// hasNumber: (value) => /[0-9]/.test(value) || "Password must include at least one number",
							// hasSpecialChar: (value) =>
							// 	/[@#$!%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) ||
							// 	"Password must include at least one special character (e.g. @, #, $, !)",
							// noSpaces: (value) => !/\s/.test(value) || "Spaces are not allowed in password",
						},
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									id="register-password"
									type="password"
									autoComplete="new-password"
									placeholder={t("sys.login.password")}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="reEnteredPassword"
					rules={{
						required: t("sys.login.confirmPasswordPlaceholder"),
						validate: (value) => value === form.getValues("password") || t("sys.login.diffPwd"),
					}}
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									id="register-confirm-password"
									type="password"
									autoComplete="new-password"
									placeholder={t("sys.login.confirmPassword")}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full">
					{t("sys.login.registerButton")}
				</Button>

				<div className="mb-2 text-xs text-gray">
					<span>{t("sys.login.registerAndAgree")}</span>
					<a href="./" className="text-sm underline! text-primary!">
						{t("sys.login.termsOfService")}
					</a>
					{" & "}
					<a href="./" className="text-sm underline! text-primary!">
						{t("sys.login.privacyPolicy")}
					</a>
				</div>

				<ReturnButton onClick={backToLogin} />
			</form>
		</Form>
	);
}

export default RegisterForm;
