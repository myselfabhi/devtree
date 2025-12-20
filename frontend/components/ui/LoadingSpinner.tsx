"use client";

import { motion } from "framer-motion";

export function LoadingSpinner() {
	return (
		<div className="flex items-center justify-center">
			<motion.div
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				className="w-8 h-8 border-4 border-[var(--card-border)] border-t-[var(--accent-purple)] rounded-full"
			/>
		</div>
	);
}


