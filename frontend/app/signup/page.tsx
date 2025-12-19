"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Create your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Or{" "}
						<Link
							href="/login"
							className="font-medium text-blue-600 hover:text-blue-500"
						>
							sign in to existing account
						</Link>
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
							{error}
						</div>
					)}
					<div className="rounded-md shadow-sm space-y-4">
						<div>
							<label htmlFor="name" className="sr-only">
								Name
							</label>
							<input
								{...register("name")}
								type="text"
								autoComplete="name"
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Full name"
							/>
							{errors.name && (
								<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
							)}
						</div>
						<div>
							<label htmlFor="email" className="sr-only">
								Email address
							</label>
							<input
								{...register("email")}
								type="email"
								autoComplete="email"
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
							)}
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								{...register("password")}
								type="password"
								autoComplete="new-password"
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Password (min 8 characters)"
							/>
							{errors.password && (
								<p className="mt-1 text-sm text-red-600">
									{errors.password.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Creating account..." : "Sign up"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}



