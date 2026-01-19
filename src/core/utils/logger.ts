import { createConsola } from "consola";

/**
 * Only logs in development mode
 *
 * @example
 * ```ts
 * debugLogger.info('User logged in', { userId: 123 });
 * debugLogger.success('Data fetched successfully');
 * debugLogger.warn('Cache expired');
 * debugLogger.error('API request failed', error);
 * debugLogger.debug('Debug info', data);
 * ```
 */
export const debugLogger = createConsola({
	level: import.meta.env.DEV ? 4 : 0, // 4 = verbose in dev, 0 = silent in prod
	formatOptions: {
		colors: true,
		compact: false,
		date: true,
	},
	// Custom reporter for dev mode only
	reporters: import.meta.env.DEV
		? [
				{
					log(logObj) {
						const { level, tag, args } = logObj;

						// Format similar to Talker's ColoredLoggerFormatter
						const levelColors: Record<number, string> = {
							0: "\x1b[31m", // error (red)
							1: "\x1b[33m", // warn (yellow)
							2: "\x1b[36m", // info (cyan)
							3: "\x1b[32m", // success (green)
							4: "\x1b[90m", // debug (gray)
							5: "\x1b[90m", // trace (gray)
						};

						const levelNames: Record<number, string> = {
							0: "ERROR",
							1: "WARN",
							2: "INFO",
							3: "SUCCESS",
							4: "DEBUG",
							5: "TRACE",
						};

						const color = levelColors[level] || "\x1b[0m";
						const levelName = levelNames[level] || "LOG";
						const reset = "\x1b[0m";
						const time = new Date().toLocaleTimeString("en-US", { hour12: false });

						// Format: [TIME] LEVEL [TAG] message
						const prefix = `${color}[${time}] ${levelName}${reset}`;
						const tagStr = tag ? ` ${color}[${tag}]${reset}` : "";

						// Handle objects separately to format them properly
						if (args.length > 1 && typeof args[1] === "object") {
							console.log(prefix + tagStr, args[0]);
							console.log(args[1]);
						} else {
							console.log(prefix + tagStr, ...args);
						}
					},
				},
			]
		: [], // No reporters in production (silent)
});

/**
 * Tagged logger factory - creates logger with a specific tag
 *
 * @example
 * ```ts
 * const storeLogger = createTaggedLogger('MultiStoreProvider');
 * storeLogger.info('Store registered');
 * // Output: [12:34:56] INFO [MultiStoreProvider] Store registered
 * ```
 */
export function createTaggedLogger(tag: string) {
	return debugLogger.withTag(tag);
}

/**
 * Default export for convenience
 */
export default debugLogger;
