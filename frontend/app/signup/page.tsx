"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const signupSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function SignupPage() {
	const router = useRouter();
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
	});

	const onSubmit = async (data: SignupFormData) => {
		setIsLoading(true);
		setError("");

		try {
			const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const result = await res.json();

			if (!res.ok || !result.success) {
				setError(result.message || "Failed to create account");
				setIsLoading(false);
				return;
			}

			// Auto-login after signup
			const signIn = await import("next-auth/react").then((m) => m.signIn);
			await signIn("credentials", {
				email: data.email,
				password: data.password,
				redirect: false,
			});

			router.push("/dashboard");
			router.refresh();
		} catch (err) {
			setError("Something went wrong. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] relative overflow-hidden flex items-center justify-center px-4">
			{/* Animated background orbs - matching Figma design */}
			<div className="absolute top-20 left-20 w-96 h-96 bg-[var(--accent-purple)]/20 rounded-full filter blur-3xl animate-pulse" />
			<div
				className="absolute bottom-20 right-20 w-96 h-96 bg-purple-900/20 rounded-full filter blur-3xl animate-pulse"
				style={{ animationDelay: "1.5s" }}
			/>

			<div className="relative z-10 w-full max-w-md">
				{/* Logo */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-8"
				>
					<div className="flex items-center justify-center gap-2 mb-2">
						<Link2 className="text-[var(--accent-purple)]" size={32} />
						<span className="text-2xl font-semibold text-[var(--text-primary)]">
							Linktree
						</span>
					</div>
					<p className="text-[var(--text-secondary)]">Create your account</p>
				</motion.div>

				{/* Form Card */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: 0.1 }}
				>
					<Card className="p-8 shadow-2xl">
						<CardContent className="p-0">
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
								<AnimatePresence>
									{error && (
										<motion.div
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											className="px-4 py-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-500 text-sm"
										>
											{error}
										</motion.div>
									)}
								</AnimatePresence>

								<motion.div
									key="signup-form"
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3 }}
								>
									<Input
										{...register("name")}
										type="text"
										label="Full Name"
										placeholder="John Doe"
										error={errors.name?.message}
										autoComplete="name"
									/>
								</motion.div>

								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: 0.1 }}
								>
									<Input
										{...register("email")}
										type="email"
										label="Email"
										placeholder="you@example.com"
										error={errors.email?.message}
										autoComplete="email"
									/>
								</motion.div>

								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: 0.2 }}
								>
									<Input
										{...register("password")}
										type="password"
										label="Password"
										placeholder="••••••••"
										error={errors.password?.message}
										autoComplete="new-password"
									/>
								</motion.div>

								<Button type="submit" disabled={isLoading} className="w-full mt-6">
									{isLoading ? (
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
											className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
										/>
									) : (
										"Create Account"
									)}
								</Button>
							</form>

							<div className="mt-6 text-center">
								<Link
									href="/login"
									className="text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors text-sm"
								>
									Already have an account? Sign in
								</Link>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="text-center mt-6"
				>
					<Link
						href="/"
						className="text-[var(--text-secondary)] hover:text-[var(--accent-purple)] transition-colors text-sm"
					>
						← Back to home
					</Link>
				</motion.div>
			</div>
		</div>
	);
}
