"use client";

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ProjectCardProps {
	projectId: string;
	username: string;
	title: string;
	description?: string;
	index: number;
}

export function ProjectCard({
	projectId,
	username,
	title,
	description,
	index,
}: ProjectCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.6 + index * 0.1 }}
			whileHover={{ scale: 1.02, y: -2 }}
		>
			<Link
				href={`/${username}/projects/${projectId}`}
				className="block w-full p-4 sm:p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] transition-all group hover:border-[var(--accent-purple)]/50 shadow-md hover:shadow-lg"
			>
				<div className="flex items-center justify-between gap-4">
					<div className="flex-1 min-w-0">
						<h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-purple)] transition-colors truncate">
							{title}
						</h3>
						{description && (
							<p className="text-sm text-[var(--text-secondary)] line-clamp-1">
								{description}
							</p>
						)}
					</div>
					<ExternalLink
						size={20}
						className="flex-shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--accent-purple)] transition-colors"
					/>
				</div>
			</Link>
		</motion.div>
	);
}

