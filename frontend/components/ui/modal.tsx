import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

interface ModalProps {
	open: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
	closable?: boolean;
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	children: React.ReactNode;
}

interface ModalDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
	children: React.ReactNode;
}

interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const Modal = ({ open, onOpenChange, children, closable = true }: ModalProps) => {
	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center p-4"
			onClick={(e) => {
				// If not closable, prevent any closing action
				if (!closable) {
					e.stopPropagation();
					return;
				}
				if (e.target === e.currentTarget && onOpenChange) {
					onOpenChange(false);
				}
			}}
			onKeyDown={(e) => {
				// Prevent ESC key from closing if not closable
				if (!closable && e.key === "Escape") {
					e.preventDefault();
					e.stopPropagation();
				}
			}}
		>
			{/* Backdrop - blocks all interaction when not closable */}
			<div 
				className="fixed inset-0 bg-black/90 backdrop-blur-sm"
				style={{ pointerEvents: closable ? "auto" : "none" }}
			/>
			
			{/* Modal Content */}
			<div 
				className="relative z-10 w-full max-w-lg"
				onClick={(e) => {
					// Prevent clicks inside modal from closing
					e.stopPropagation();
				}}
			>
				{children}
			</div>
		</div>
	);
};

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"relative rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl",
				className
			)}
			{...props}
		>
			{children}
		</div>
	)
);
ModalContent.displayName = "ModalContent";

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex flex-col space-y-1.5 p-6", className)}
			{...props}
		>
			{children}
		</div>
	)
);
ModalHeader.displayName = "ModalHeader";

const ModalTitle = React.forwardRef<HTMLHeadingElement, ModalTitleProps>(
	({ className, children, ...props }, ref) => (
		<h2
			ref={ref}
			className={cn(
				"text-2xl font-semibold leading-none tracking-tight text-[var(--text-primary)]",
				className
			)}
			{...props}
		>
			{children}
		</h2>
	)
);
ModalTitle.displayName = "ModalTitle";

const ModalDescription = React.forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
	({ className, children, ...props }, ref) => (
		<p
			ref={ref}
			className={cn("text-sm text-[var(--text-secondary)]", className)}
			{...props}
		>
			{children}
		</p>
	)
);
ModalDescription.displayName = "ModalDescription";

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex items-center justify-end gap-3 p-6 pt-0", className)}
			{...props}
		>
			{children}
		</div>
	)
);
ModalFooter.displayName = "ModalFooter";

export {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalDescription,
	ModalFooter,
};

