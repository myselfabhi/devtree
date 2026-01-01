import * as React from "react";

import { cn } from "./utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, label, error, ...props }, ref) => {
		return (
			<div className="w-full">
				{label && (
					<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
						{label}
					</label>
				)}
				<input
					type={type}
					className={cn(
						"flex h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
						error && "border-red-500 focus-visible:ring-red-500",
						className
					)}
					ref={ref}
					{...props}
				/>
				{error && (
					<p className="mt-1 text-sm text-red-500">{error}</p>
				)}
			</div>
		);
	}
);
Input.displayName = "Input";

export { Input };











