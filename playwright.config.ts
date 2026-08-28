import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/visual",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: "list",
	use: {
		baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173",
		trace: "off",
		video: "off",
		screenshot: "only-on-failure",
		locale: "en-US",
		timezoneId: "Asia/Ho_Chi_Minh",
		colorScheme: "light",
		deviceScaleFactor: 1,
		isMobile: false,
		viewport: { width: 1920, height: 1080 },
		actionTimeout: 10_000,
		navigationTimeout: 30_000,
	},
	expect: {
		timeout: 10_000,
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: process.env.PLAYWRIGHT_SKIP_SERVER
		? undefined
		: {
				command: "pnpm dev --host 127.0.0.1 --port 4173",
				url: "http://127.0.0.1:4173",
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
			},
});
