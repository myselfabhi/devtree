"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import { cn } from "./utils";

interface ColorPickerProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	// Predefined color palette
	const presetColors = [
		"#1a1a1a", // Dark
		"#2d2d2d", // Dark gray
		"#3b3b3b", // Medium gray
		"#6366f1", // Indigo
		"#8b5cf6", // Purple
		"#ec4899", // Pink
		"#f59e0b", // Amber
		"#10b981", // Emerald
		"#06b6d4", // Cyan
		"#ef4444", // Red
		"#ffffff", // White
		"#000000", // Black
	];

	const handleColorChange = (color: string) => {
		onChange(color);
		setIsOpen(false);
	};

	return (
		<div className={cn("space-y-2", className)}>
			<label className="block text-sm font-medium text-[var(--text-secondary)]">
				{label}
			</label>
			<div className="relative">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="w-full flex items-center gap-3 p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl hover:border-[var(--accent-purple)] transition-colors"
				>
					<div
						className="w-8 h-8 rounded-lg border-2 border-[var(--card-border)]"
						style={{ backgroundColor: value || "#1a1a1a" }}
					/>
					<span className="flex-1 text-left text-sm text-[var(--text-primary)] font-mono">
						{value || "#1a1a1a"}
					</span>
					<Palette size={18} className="text-[var(--text-secondary)]" />
				</button>

				<AnimatePresence>
					{isOpen && (
						<motion.div
							ref={dropdownRef}
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="absolute top-full left-0 right-0 mt-2 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl z-50"
						>
							<div className="space-y-4">
								{/* Preset Colors */}
								<div>
									<p className="text-xs text-[var(--text-secondary)] mb-2">Preset Colors</p>
									<div className="grid grid-cols-6 gap-2">
										{presetColors.map((color) => (
											<button
												key={color}
												type="button"
												onClick={() => handleColorChange(color)}
												className={cn(
													"w-10 h-10 rounded-lg border-2 transition-all hover:scale-110",
													value === color
														? "border-[var(--accent-purple)] ring-2 ring-[var(--accent-purple)]/50"
														: "border-[var(--card-border)] hover:border-[var(--accent-purple)]/50"
												)}
												style={{ backgroundColor: color }}
											/>
										))}
									</div>
								</div>

								{/* Custom Color Input */}
								<div>
									<p className="text-xs text-[var(--text-secondary)] mb-2">Custom Color</p>
									<div className="flex items-center gap-2">
										<input
											type="color"
											value={value || "#1a1a1a"}
											onChange={(e) => handleColorChange(e.target.value)}
											className="w-12 h-12 rounded-lg border-2 border-[var(--card-border)] cursor-pointer"
										/>
										<input
											type="text"
											value={value || "#1a1a1a"}
											onChange={(e) => {
												if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) {
													onChange(e.target.value);
												}
											}}
											placeholder="#1a1a1a"
											className="flex-1 px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-sm text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent-purple)] focus:border-transparent"
										/>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}

