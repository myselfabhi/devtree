export type ValidationStatus = "live" | "down" | "slow" | "unknown";

interface ValidationResult {
	status: ValidationStatus;
	responseTime?: number;
	statusCode?: number;
	error?: string;
}

const TIMEOUT_MS = 10000;
const SLOW_THRESHOLD_MS = 3000;

function isPrivateIP(hostname: string): boolean {
	if (!hostname) return false;
	
	try {
		const hostnameLower = hostname.toLowerCase();
		
		if (hostnameLower === "localhost" || hostnameLower === "127.0.0.1") {
			return true;
		}
		
		const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
		const match = hostname.match(ipRegex);
		
		if (match) {
			const [, a, b, c] = match.map(Number);
			
			if (a === 10) return true;
			if (a === 172 && b >= 16 && b <= 31) return true;
			if (a === 192 && b === 168) return true;
			if (a === 127) return true;
			if (a === 0) return true;
		}
		
		return false;
	} catch {
		return false;
	}
}

function isValidUrl(url: string): boolean {
	try {
		const urlObj = new URL(url);
		return urlObj.protocol === "http:" || urlObj.protocol === "https:";
	} catch {
		return false;
	}
}

export async function validateUrl(url: string): Promise<ValidationResult> {
	if (!url || !url.trim()) {
		return { status: "unknown", error: "URL is required" };
	}

	const trimmedUrl = url.trim();

	if (!isValidUrl(trimmedUrl)) {
		return { status: "unknown", error: "Invalid URL format" };
	}

	try {
		const urlObj = new URL(trimmedUrl);
		
		if (isPrivateIP(urlObj.hostname)) {
			return { status: "unknown", error: "Private IP addresses are not allowed" };
		}

		const startTime = Date.now();
		
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

		try {
			const response = await fetch(trimmedUrl, {
				method: "GET",
				signal: controller.signal,
				redirect: "follow",
				headers: {
					"User-Agent": "Mozilla/5.0 (compatible; ProjectPortfolioBot/1.0)",
				},
			});

			clearTimeout(timeoutId);
			const responseTime = Date.now() - startTime;
			const statusCode = response.status;

			if (statusCode >= 200 && statusCode < 400) {
				if (responseTime < SLOW_THRESHOLD_MS) {
					return { status: "live", responseTime, statusCode };
				} else {
					return { status: "slow", responseTime, statusCode };
				}
			} else if (statusCode >= 400 && statusCode < 500) {
				return { status: "down", responseTime, statusCode };
			} else if (statusCode >= 500) {
				return { status: "down", responseTime, statusCode };
			} else {
				return { status: "unknown", responseTime, statusCode };
			}
		} catch (fetchError: any) {
			clearTimeout(timeoutId);
			const responseTime = Date.now() - startTime;

			if (fetchError.name === "AbortError") {
				if (responseTime >= TIMEOUT_MS) {
					return { status: "slow", responseTime, error: "Slow response (timed out)" };
				}
				return { status: "down", responseTime, error: "Request timeout" };
			}

			if (fetchError.code === "ENOTFOUND" || fetchError.code === "ECONNREFUSED") {
				return { status: "down", responseTime, error: fetchError.message };
			}

			return { status: "unknown", responseTime, error: fetchError.message };
		}
	} catch (error: any) {
		return { status: "unknown", error: error.message || "Validation failed" };
	}
}

