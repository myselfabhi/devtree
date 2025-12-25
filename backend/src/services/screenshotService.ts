import puppeteer from "puppeteer";
import { uploadToR2 } from "./r2Service.js";

const SCREENSHOT_WIDTH = 1280;
const SCREENSHOT_HEIGHT = 720;
const TIMEOUT_MS = 30000;

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

export async function captureScreenshot(url: string): Promise<string> {
	if (!url || !url.trim()) {
		throw new Error("URL is required");
	}

	const trimmedUrl = url.trim();

	if (!isValidUrl(trimmedUrl)) {
		throw new Error("Invalid URL format");
	}

	try {
		const urlObj = new URL(trimmedUrl);
		
		if (isPrivateIP(urlObj.hostname)) {
			throw new Error("Private IP addresses are not allowed");
		}
	} catch (error: any) {
		throw new Error(error.message || "Invalid URL");
	}

	let browser = null;

	try {
		browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-accelerated-2d-canvas",
				"--disable-gpu",
			],
		});

		const page = await browser.newPage();
		
		await page.setViewport({
			width: SCREENSHOT_WIDTH,
			height: SCREENSHOT_HEIGHT,
			deviceScaleFactor: 1,
		});

		await page.goto(trimmedUrl, {
			waitUntil: "networkidle2",
			timeout: TIMEOUT_MS,
		});

		await new Promise((resolve) => setTimeout(resolve, 10000));

		const screenshotBuffer = await page.screenshot({
			type: "jpeg",
			quality: 85,
			fullPage: false,
		});

		const screenshotUrl = await uploadToR2(
			screenshotBuffer as Buffer,
			"screenshot.jpg",
			"image/jpeg",
			"screenshots" as any
		);

		return screenshotUrl;
	} catch (error: any) {
		console.error("Screenshot capture error:", error);
		throw new Error(`Failed to capture screenshot: ${error.message}`);
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

