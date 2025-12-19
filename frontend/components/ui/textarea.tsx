import * as React from "react";

import { cn } from "./utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, error, ...props }, ref) => {
		return (
			<div className="w-full">
				{label && (
					<label className="block mb-2 text-[var(--text-secondary)] font-medium text-sm">
						{label}
					</label>
				)}
				<textarea
					className={cn(
						"flex min-h-[80px] w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-purple)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none",
						error && "border-red-500 focus-visible:ring-red-500",
						className
					)}
					ref={ref}
					{...props}
				/>
				{error && <p className="mt-1 text-sm text-red-500">{error}</p>}
			</div>
		);
	}
);
Textarea.displayName = "Textarea";

export { Textarea };

