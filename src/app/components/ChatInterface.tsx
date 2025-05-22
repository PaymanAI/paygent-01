import type React from "react";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef, useCallback } from "react";
import { PaymanClient } from "@paymanai/payman-ts";
import { AUTH_CONFIG } from "@/config/auth";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
}

export function ChatInterface() {
	const [waitingForResponse, setWaitingForResponse] = useState(false);
	const [client, setClient] = useState<PaymanClient | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
	};

	const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleFormSubmit(e as unknown as React.FormEvent);
		}
	};

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [scrollToBottom]);

	useEffect(() => {
		console.log("AUTH_CONFIG", AUTH_CONFIG);
		// Initialize PaymanClient when component mounts
		const paymanClient = new PaymanClient({
			clientId: AUTH_CONFIG.clientId,
			clientSecret: AUTH_CONFIG.clientSecret,
			environment: "INTERNAL",
		});
		setClient(paymanClient);
	}, []);

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		try {
			setWaitingForResponse(true);
			setIsLoading(true);

			// Add user message to the chat
			const userMessage: Message = {
				id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
				role: "user",
				content: input,
			};
			setMessages((prev) => {
				const newMessages = [...prev, userMessage];
				return newMessages;
			});

			const response = await client?.ask(input);
			if (response?.error) {
				throw new Error("Failed to send message to API");
			}

			console.log("API Response:", response);

			// Extract the response from artifacts
			if (response?.artifacts) {
				const responseText = response.artifacts[0].content;
				// Add the assistant's response to messages
				const assistantMessage: Message = {
					id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
					role: "assistant",
					content: responseText,
				};
				console.log("Adding assistant message:", assistantMessage);
				setMessages((prev) => {
					const newMessages = [...prev, assistantMessage];
					console.log("Updated messages:", newMessages);
					return newMessages;
				});
			}
		} catch (error) {
			console.error("Error sending message:", error);
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setWaitingForResponse(false);
			setIsLoading(false);
			setInput("");
		}
	};

	return (
		<div className="flex-1 flex flex-col bg-white">
			<div className="flex-1 overflow-y-auto">
				<div className="p-4">
					<div className="space-y-4 pb-8">
						{messages.map((m: Message) => {
							return m.content ? (
								<div key={m.id} className="space-y-2">
									<div
										className={`flex ${
											m.role === "user" ? "justify-end" : "justify-start"
										}`}
									>
										<div
											className={`${
												m.role === "user"
													? "bg-payman-primary text-black shadow-sm"
													: "bg-payman-neutral text-payman-dark shadow-sm"
											} rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[75%] transition-colors`}
										>
											{m.role === "user" ? (
												<div className="whitespace-pre-wrap text-[15px] text-black">
													{m.content}
												</div>
											) : (
												<div className="prose !text-gray-900 max-w-none prose-p:leading-relaxed prose-pre:bg-white/80 prose-pre:text-sm prose-p:!text-gray-900 prose-headings:!text-gray-900 prose-li:!text-gray-900">
													<ReactMarkdown>{m.content}</ReactMarkdown>
												</div>
											)}
										</div>
									</div>
								</div>
							) : null;
						})}
						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-payman-neutral text-payman-dark shadow-sm rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[75%]">
									<div className="flex items-center gap-2 min-h-[24px]">
										{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
										<svg
											className="animate-spin h-4 w-4 text-payman-primary/70"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										<span className="text-sm text-payman-dark/70">
											Thinking...
										</span>
									</div>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>
				</div>
			</div>

			<div className="flex-shrink-0 border-t border-payman-neutral/30 bg-white">
				{error && (
					<div className="px-4 py-2 bg-red-50 border-b border-red-100">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}
				<form onSubmit={handleFormSubmit} className="p-4">
					<div className="flex space-x-3">
						<input
							className="flex-1 px-4 py-3 border border-payman-neutral/50 rounded-2xl bg-payman-neutral/5 focus:outline-none focus:ring-2 focus:ring-payman-primary/30 focus:border-payman-primary/50 transition-all placeholder:text-gray-400 text-gray-900"
							value={input}
							placeholder="Type your message..."
							onChange={handleInputChange}
							onKeyDown={handleInputKeyDown}
						/>
						<button
							type="submit"
							className="px-6 py-3 bg-payman-primary text-black rounded-2xl hover:bg-payman-primary/90 focus:outline-none focus:ring-2 focus:ring-payman-primary/30 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={!input.trim() || isLoading || waitingForResponse}
						>
							{isLoading || waitingForResponse ? "Sending..." : "Send"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
