import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import type { Result } from "lighthouse";

interface LighthouseScores {
	performance: number;
	accessibility: number;
	bestPractices: number;
	seo: number;
}

const LIGHTHOUSE_TIMEOUT = 90000;

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
			const [, a, b] = match.map(Number);
			
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

export async function runLighthouseAudit(url: string): Promise<LighthouseScores | null> {
	if (!url || !url.trim()) {
		return null;
	}

	const trimmedUrl = url.trim();

	if (!isValidUrl(trimmedUrl)) {
		return null;
	}

	try {
		const urlObj = new URL(trimmedUrl);
		
		if (isPrivateIP(urlObj.hostname)) {
			return null;
		}
	} catch {
		return null;
	}

	let browser = null;

	try {
		browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-gpu",
			],
		});

		const page = await browser.newPage();
		
		const portMatch = browser.wsEndpoint().match(/:(\d+)\//);
		const port = portMatch ? parseInt(portMatch[1], 10) : 9222;
		
		const options = {
			logLevel: "error" as const,
			output: "json" as const,
			onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
			port: port,
			disableStorageReset: true,
		};

		const result = await lighthouse(trimmedUrl, options, undefined, page);

		if (!result || !result.lhr) {
			return null;
		}

		const scores = result.lhr.categories;

		return {
			performance: Math.round((scores.performance?.score || 0) * 100),
			accessibility: Math.round((scores.accessibility?.score || 0) * 100),
			bestPractices: Math.round((scores["best-practices"]?.score || 0) * 100),
			seo: Math.round((scores.seo?.score || 0) * 100),
		};
	} catch (error) {
		console.error("Lighthouse audit error:", error);
		return null;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

