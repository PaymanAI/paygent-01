import React, { useState, useEffect } from "react";
import Script from "next/script";
import { PaymanClient } from "@paymanai/payman-ts";
import { AUTH_CONFIG } from "@/config/auth";

export function ConfigSection() {
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const accessToken = localStorage.getItem("access_token");
		setIsConnected(!!accessToken);
	}, []);

	const startNewSession = () => {
		window.dispatchEvent(new CustomEvent("startNewSession"));
	};

	const initializePayman = () => {
		try {
			const client = new PaymanClient({
				clientId: AUTH_CONFIG.clientId,
				clientSecret: AUTH_CONFIG.clientSecret,
			});
			console.log("Payman client initialized successfully");
			// You can store the client instance in state or context if needed
		} catch (error) {
			console.error("Failed to initialize Payman client:", error);
		}
	};

	// Add OAuth listener effect
	useEffect(() => {
		const handleMessage = async (event: MessageEvent) => {
			console.log("OAuth Listener: Received message:", event.data);
			if (event.data.type === "payman-oauth-redirect") {
				console.log("OAuth Listener: Processing redirect");
				const url = new URL(event.data.redirectUri);
				const code = url.searchParams.get("code");
				console.log("OAuth Listener: Received code:", code);

				if (code) {
					try {
						console.log("OAuth Listener: Making token exchange request");
						const response = await fetch("/api/auth/token", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ code }),
						});

						if (!response.ok) {
							const errorText = await response.text();
							console.error("OAuth Listener: Token exchange failed:", {
								status: response.status,
								statusText: response.statusText,
								error: errorText,
							});
							throw new Error("Failed to exchange code for token");
						}

						const data = await response.json();
						console.log("OAuth Listener: Token exchange successful:", data);
						console.log("OAuth Listener: Access token:", data.accessToken);

						localStorage.setItem("access_token", data.accessToken);
						console.log("OAuth Listener: Token saved to localStorage");

						setIsConnected(true);

						await new Promise((resolve) => setTimeout(resolve, 100));

						const savedToken = localStorage.getItem("access_token");
						console.log("OAuth Listener: Verified saved token:", savedToken);

						console.log("OAuth Listener: Current URL:", window.location.href);
						console.log("OAuth Listener: Would redirect to:", url.toString());
					} catch (error) {
						console.error("OAuth Listener: Error:", error);
					}
				} else {
					console.log("OAuth Listener: No code found in URL");
				}
			} else {
				console.log(
					"OAuth Listener: Received message with unexpected type:",
					event.data.type,
				);
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, []);

	return (
		<div className="p-4 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
			<h2 className="text-sm font-semibold text-gray-900 mb-3">
				Configuration
			</h2>

			<div className="space-y-3">
				{/* Info Section */}
				<div className="p-3 bg-payman-primary/5 rounded-lg border border-payman-primary/20">
					<div className="flex items-start space-x-2">
						<div className="flex-shrink-0 w-4 h-4 mt-0.5">
							{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="text-payman-primary"
							>
								<path
									fillRule="evenodd"
									d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h3 className="text-xs font-medium text-gray-900">
								Configure Your Paygent
							</h3>
						</div>
					</div>
				</div>

				{/* Buttons Section */}
				<div className="flex justify-end space-x-3">
					{isConnected ? (
						<>
							<button
								type="button"
								onClick={startNewSession}
								className="px-4 py-2 bg-payman-neutral text-payman-dark rounded-xl hover:bg-payman-neutral/80 focus:outline-none focus:ring-2 focus:ring-payman-primary/30 transition-all font-medium shadow-sm"
							>
								New Session
							</button>
							<button
								type="button"
								className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all font-medium shadow-sm"
								disabled
							>
								Connected
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={initializePayman}
							className="px-4 py-2 bg-payman-primary text-white transition-all font-medium bg-black"
						>
							Connect Payman
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
