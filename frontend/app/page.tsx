"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Link2, Sparkles, ChartBar, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] relative overflow-hidden">
			{/* Animated gradient orbs */}
			<div className="absolute top-0 left-0 w-96 h-96 bg-[var(--accent-purple)]/20 rounded-full filter blur-3xl animate-pulse" />
			<div
				className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/20 rounded-full filter blur-3xl animate-pulse"
				style={{ animationDelay: "1s" }}
			/>

			<div className="relative z-10 container mx-auto px-4 py-16">
				{/* Header */}
				<motion.header
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex justify-between items-center mb-20"
				>
					<div className="flex items-center gap-2">
						<Link2 className="text-[var(--accent-purple)]" size={32} />
						<span className="text-2xl font-semibold text-[var(--text-primary)]">
							Linktree
						</span>
					</div>
					<Link href="/login">
						<Button variant="outline">Sign In</Button>
					</Link>
				</motion.header>

				{/* Hero Section */}
				<div className="max-w-4xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-[var(--text-primary)] to-[var(--accent-purple)] bg-clip-text text-transparent font-bold">
							Create Your Link Page
						</h1>
						<p className="text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto">
							Share all your important links in one beautiful page. Perfect for
							creators, businesses, and everyone in between.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
					>
						<Link href="/signup">
							<Button>Get Started Free</Button>
						</Link>
						<Link href="/login">
							<Button variant="outline">View Example</Button>
						</Link>
					</motion.div>

					{/* Features Grid */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.6 }}
						className="grid md:grid-cols-3 gap-6 mt-20"
					>
						{[
							{
								icon: Sparkles,
								title: "Beautiful Design",
								description:
									"Stunning dark theme with customizable colors and smooth animations",
							},
							{
								icon: ChartBar,
								title: "Track Performance",
								description:
									"Monitor clicks and engagement with built-in analytics",
							},
							{
								icon: Palette,
								title: "Full Customization",
								description:
									"Personalize your page with custom fonts, colors, and layouts",
							},
						].map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.8 + index * 0.1 }}
								whileHover={{ y: -8, scale: 1.05 }}
								className="bg-[var(--card-bg)]/50 backdrop-blur-sm border border-[var(--card-border)] rounded-xl p-8"
							>
								<feature.icon
									className="text-[var(--accent-purple)] mx-auto mb-4"
									size={40}
								/>
								<h3 className="mb-2 text-[var(--text-primary)] font-semibold">
									{feature.title}
								</h3>
								<p className="text-[var(--text-secondary)]">
									{feature.description}
								</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</div>
		</div>
	);
}