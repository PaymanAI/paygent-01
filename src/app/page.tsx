"use client";

import { useEffect, useRef, useState } from "react";
import { ConfigSection } from "./components/ConfigSection";
import { ChatInterface } from "./components/ChatInterface";
import { API_CONFIG } from "@/config/auth";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
}

export default function Home() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [sessionId] = useState(() => Math.random().toString(36).substring(2));

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		setIsLoading(true);
		try {
			// Add user message to the chat
			const userMessage: Message = {
				id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
				role: "user",
				content: input,
			};
			setMessages((prev) => [...prev, userMessage]);
			setInput("");

			// Make the API call
			const accessToken = localStorage.getItem("access_token");
			if (!accessToken) {
				throw new Error("No access token found");
			}

			const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2)}`;
			const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2)}`;

			const response = await fetch(`${API_CONFIG.host}/a2a/tasks/send`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-payman-access-token": accessToken,
				},
				body: JSON.stringify({
					jsonrpc: "2.0",
					id: requestId,
					method: "tasks/send",
					params: {
						id: taskId,
						message: {
							role: "user",
							parts: [
								{
									type: "text",
									text: input,
								},
							],
						},
						sessionId: sessionId,
					},
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to send message to API");
			}

			const responseData = await response.json();
			console.log("API Response:", responseData);

			// Extract the response from artifacts
			if (responseData.result?.artifacts?.[0]?.parts?.[0]?.text) {
				const responseText = responseData.result.artifacts[0].parts[0].text;
				try {
					console.log("responseText", responseText);
					// Add the assistant's response to messages
					const newMessage: Message = {
						id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
						role: "assistant",
						content: responseText,
					};
					setMessages((prev) => [...prev, newMessage]);
				} catch (parseError) {
					console.error("Error parsing response:", parseError);
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			handleSubmit(e as unknown as React.FormEvent);
		}
	};

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="flex flex-col h-screen">
			<main className="flex h-screen bg-gray-50">
				<div className="w-[300px] border-r border-gray-200 bg-white flex flex-col">
					<ConfigSection />
				</div>

				<div className="flex-1 flex flex-col">
					<div className="bg-white border-b border-payman-neutral/30">
						<div className="py-2">
							<div className="text-center flex mr-6">
								<h1 className="text-5xl font-bold text-gray-900 tracking-tight flex-1">
									PAYGENT
									<span className="text-payman-primary relative">
										.
										<span className="relative inline-block px-[2px]">
											0
											<span className="absolute inset-0 flex items-center justify-center overflow-visible">
												<span className="h-[4px] w-[100%] bg-payman-primary rotate-[-70deg] block absolute transform -translate-y-[1px]" />
											</span>
										</span>
										1
									</span>
								</h1>
							</div>
						</div>
					</div>

					<div className="flex-1 flex overflow-hidden">
						<ChatInterface
							messages={messages}
							setMessages={setMessages}
							input={input}
							handleInputChange={handleInputChange}
							handleSubmit={handleSubmit}
							handleInputKeyDown={handleInputKeyDown}
							messagesEndRef={messagesEndRef}
							error={error}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}
