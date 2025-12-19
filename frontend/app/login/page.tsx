"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		setError("");

		try {
			const result = await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password");
				setIsLoading(false);
			} else {
				router.push("/dashboard");
				router.refresh();
			}
		} catch (err) {
			setError("Something went wrong. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="min-h-screen flex items-center justify-center px-4"
			style={{
				background: "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-tertiary) 100%)",
			}}
		>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="max-w-md w-full space-y-8"
			>
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<motion.h2
						initial={{ scale: 0.9 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", stiffness: 200 }}
						className="mt-6 text-center text-3xl font-extrabold"
						style={{ color: "var(--text-primary)" }}
					>
						Sign in to your account
					</motion.h2>
					<p className="mt-2 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
						Or{" "}
						<motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
						<Link
							href="/signup"
							className="font-medium transition-colors"
							style={{ color: "var(--accent-primary)" }}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = "var(--accent-hover)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = "var(--accent-primary)";
							}}
						>
							create a new account
						</Link>
						</motion.span>
					</p>
				</motion.div>
				<motion.form
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="mt-8 space-y-6"
					onSubmit={handleSubmit(onSubmit)}
				>
					<AnimatePresence>
						{error && (
							<motion.div
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								className="px-4 py-3 rounded border"
								style={{
									backgroundColor: "rgba(239, 68, 68, 0.1)",
									borderColor: "var(--error)",
									color: "var(--error)",
								}}
							>
								{error}
							</motion.div>
						)}
					</AnimatePresence>
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className="rounded-md shadow-lg -space-y-px p-6 rounded-lg"
						style={{
							backgroundColor: "var(--bg-card)",
							border: "1px solid var(--border-color)",
						}}
					>
						<div>
							<label htmlFor="email" className="sr-only">
								Email address
							</label>
							<motion.input
								whileFocus={{ scale: 1.02 }}
								{...register("email")}
								type="email"
								autoComplete="email"
								className="appearance-none rounded-none relative block w-full px-3 py-2 border rounded-t-md focus:outline-none focus:z-10 sm:text-sm transition-colors"
								style={{
									borderColor: "var(--border-color)",
									backgroundColor: "var(--bg-secondary)",
									color: "var(--text-primary)",
								}}
								onFocus={(e) => {
									e.currentTarget.style.borderColor = "var(--accent-primary)";
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = "var(--border-color)";
								}}
								placeholder="Email address"
							/>
							<AnimatePresence>
								{errors.email && (
									<motion.p
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="mt-1 text-sm text-red-600"
									>
										{errors.email.message}
									</motion.p>
								)}
							</AnimatePresence>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<motion.input
								whileFocus={{ scale: 1.02 }}
								{...register("password")}
								type="password"
								autoComplete="current-password"
								className="appearance-none rounded-none relative block w-full px-3 py-2 border rounded-b-md focus:outline-none focus:z-10 sm:text-sm transition-colors"
								style={{
									borderColor: "var(--border-color)",
									backgroundColor: "var(--bg-secondary)",
									color: "var(--text-primary)",
								}}
								onFocus={(e) => {
									e.currentTarget.style.borderColor = "var(--accent-primary)";
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = "var(--border-color)";
								}}
								placeholder="Password"
							/>
							<AnimatePresence>
								{errors.password && (
									<motion.p
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="mt-1 text-sm text-red-600"
									>
										{errors.password.message}
									</motion.p>
								)}
							</AnimatePresence>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5 }}
					>
						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
							style={{
								backgroundColor: "var(--accent-primary)",
								color: "var(--text-primary)",
							}}
							onMouseEnter={(e) => {
								if (!isLoading) {
									e.currentTarget.style.backgroundColor = "var(--accent-hover)";
								}
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "var(--accent-primary)";
							}}
						>
							{isLoading ? (
								<motion.span
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
									className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
								/>
							) : (
								"Sign in"
							)}
						</motion.button>
					</motion.div>
				</motion.form>
			</motion.div>
		</motion.div>
	);
}



