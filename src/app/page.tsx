"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { ConfigSection } from "./components/ConfigSection";
import { QuickActions } from "./components/QuickActions";
import { ChatInterface } from "./components/ChatInterface";
import { ToolCallsPanel } from "./components/ToolCallsPanel";
import { quickActions } from "./components/QuickActions";
import { CollapsibleArrayItem } from "./components/CollapsibleArrayItem";
import type { ApiInfo } from "./components/types";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [paymanApiKey, setPaymanApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [error, setError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showLiveModeModal, setShowLiveModeModal] = useState(false);

  // Load API keys and provider from localStorage on mount
  useEffect(() => {
    const storedProvider = localStorage.getItem("aiProvider") as
      | "openai"
      | "anthropic";
    if (storedProvider) {
      setProvider(storedProvider);
      const storedApiKey = localStorage.getItem(`${storedProvider}ApiKey`);
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
    }
    const storedPaymanKey = localStorage.getItem("paymanApiKey");
    if (storedPaymanKey) {
      setPaymanApiKey(storedPaymanKey);
    }
    const storedMode = localStorage.getItem("paymanMode");
    if (storedMode === "live") {
      setIsLiveMode(true);
    }
  }, []);

  // Handle API key changes
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    if (newApiKey) {
      localStorage.setItem(`${provider}ApiKey`, newApiKey);
    } else {
      localStorage.removeItem(`${provider}ApiKey`);
    }
  };

  // Handle Payman API key changes
  const handlePaymanApiKeyChange = (newApiKey: string) => {
    setPaymanApiKey(newApiKey);
    if (newApiKey) {
      localStorage.setItem("paymanApiKey", newApiKey);
    } else {
      localStorage.removeItem("paymanApiKey");
    }
  };

  // Handle provider changes
  const handleProviderChange = (newProvider: "openai" | "anthropic") => {
    console.log("Setting provider to:", newProvider);
    setProvider(newProvider);
    localStorage.setItem("aiProvider", newProvider);

    // Load the API key for the new provider
    const savedKey = localStorage.getItem(`${newProvider}ApiKey`);
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setApiKey(""); // Clear the API key if none exists for this provider
    }
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    addToolResult,
    setInput,
    append,
    isLoading,
    error: chatError,
  } = useChat({
    maxSteps: 5, // Prevent retries
    body: {
      provider,
    },
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Payman-API-Key": paymanApiKey,
    },
    async onToolCall({ toolCall }) {
      console.log("Tool call:", toolCall);
      try {
        // Tools that require user input
        if (
          toolCall.toolName === "makePayment" ||
          toolCall.toolName === "createPayee" ||
          toolCall.toolName === "initiatePayment" ||
          toolCall.toolName === "processPayment"
        ) {
          // Return a special response that will be parsed by the chat interface
          return JSON.stringify({
            type: "TOOL_FORM",
            toolName: toolCall.toolName,
            toolCallId: toolCall.toolCallId,
            args: toolCall.args,
          });
        }

        // Handle other tools
        if (toolCall.toolName === "getPaymentMethod") {
          return "Credit Card ending in 1234";
        }

        return `Successfully called ${
          toolCall.toolName
        } with parameters: ${JSON.stringify(toolCall.args)}`;
      } catch (error) {
        console.error("Tool call error:", error);
        return JSON.stringify({
          error:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
          status: "error",
        });
      }
    },
    onResponse(response) {
      console.log("Response status:", response.status, response.ok);

      if (!response.ok) {
        setError(
          "Failed to get response. Please check your API key and try again."
        );
      } else {
        setError(null);
      }
    },
    onFinish(message) {
      // Only append a message if there's actual content and it's not an error response
      console.log("Finished message:", message);

      if (
        message.content &&
        message.content.trim() !== "" &&
        !message.content.includes("Sorry, there was an error")
      ) {
        setError(null);
      }
    },
    onError(error) {
      console.error("Full error object:", error);
      console.error("Error stack:", error.stack);
      // Get any additional error properties
      if (error instanceof Error) {
        console.error("Error cause:", error.cause);
        // Log any custom properties that might exist
        console.error(
          "Additional properties:",
          Object.getOwnPropertyNames(error)
        );
      }

      const errorMessage =
        error instanceof Error
          ? `${error.message} (${error.cause || "no cause"})`
          : "An unexpected error occurred";
      setError(errorMessage);
    },
  });

  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const messagesEndRef = useRef<HTMLDivElement>(null!);
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const toolCallsEndRef = useRef<HTMLDivElement>(null!);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const matchingAction = quickActions.find(
        (action) => input === action.shortcut
      );
      if (matchingAction) {
        e.preventDefault();
        append({
          content: matchingAction.query,
          role: "user",
        });
        setInput("");
      }
    }
  };

  const toolCallCount = messages.reduce(
    (count, m) => count + (m.toolInvocations?.length || 0),
    0
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    toolCallsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [toolCallCount]);

  const getApiInfo = (toolName: string): ApiInfo => {
    const methodMap: { [key: string]: string } = {
      searchDestinations: "GET",
      createPayee: "POST",
      initiateDeposit: "POST",
      makePayment: "POST",
      getBalance: "GET",
      confirmPayment: "POST",
    };

    const endpointMap: { [key: string]: string } = {
      searchDestinations: "/v1/payments/destinations",
      createPayee: "/v1/payments/payees",
      initiateDeposit: "/v1/payments/deposits",
      makePayment: "/v1/payments/send",
      getBalance: "/v1/balances",
      confirmPayment: "/v1/payments/confirm",
    };

    return {
      method: methodMap[toolName] || "POST",
      endpoint: endpointMap[toolName] || `/v1/${toolName.toLowerCase()}`,
    };
  };

  const formatToolCallResult = (result: string): React.ReactNode => {
    console.log(result);
    try {
      // First try to parse the entire result as JSON
      const parsed = JSON.parse(result);
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-500">
              {parsed.length} {parsed.length === 1 ? "item" : "items"} found
            </div>
            <div>
              {parsed.map((item, index) => (
                <CollapsibleArrayItem key={item.id || index} item={item} />
              ))}
            </div>
          </div>
        );
      }
      return <pre className="text-sm">{JSON.stringify(parsed, null, 2)}</pre>;
    } catch (e) {
      // If direct parsing fails, try to find JSON within the string
      try {
        // Look for common patterns like "Found destinations: " followed by JSON
        const jsonMatch = result.match(/^([^"]*)"(\[.*\]|\{.*\})"$/s);
        if (jsonMatch) {
          const prefix = jsonMatch[1];
          const jsonStr = jsonMatch[2].replace(/\\"/g, '"'); // Remove escaped quotes
          const parsed = JSON.parse(jsonStr);

          return (
            <div className="space-y-2">
              {prefix && (
                <div className="text-gray-600 font-medium">{prefix.trim()}</div>
              )}
              {Array.isArray(parsed) ? (
                <div>
                  <div className="text-sm text-gray-500 mb-2">
                    {parsed.length} {parsed.length === 1 ? "item" : "items"}{" "}
                    found
                  </div>
                  {parsed.map((item, index) => (
                    <CollapsibleArrayItem key={item.id || index} item={item} />
                  ))}
                </div>
              ) : (
                <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                  {JSON.stringify(parsed, null, 2)}
                </pre>
              )}
            </div>
          );
        }

        // Try the old pattern as fallback
        const oldJsonMatch = result.match(/^[^{]*({\s*".*})/s);
        if (oldJsonMatch) {
          const jsonStr = oldJsonMatch[1];
          const parsed = JSON.parse(jsonStr);
          return (
            <div className="space-y-2">
              <div className="text-gray-600">
                {result.substring(0, result.indexOf(jsonStr)).trim()}
              </div>
              <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(parsed, null, 2)}
              </pre>
            </div>
          );
        }
      } catch (e2) {
        console.error("Failed to parse JSON within string:", e2);
      }
      // Return as plain text if no JSON found
      return result;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main className="flex h-screen bg-gray-50">
        <div className="w-[300px] border-r border-gray-200 bg-white flex flex-col">
          <ConfigSection
            apiKey={apiKey}
            setApiKey={handleApiKeyChange}
            provider={provider}
            setProvider={handleProviderChange}
            paymanApiKey={paymanApiKey}
            setPaymanApiKey={handlePaymanApiKeyChange}
          />
          <div className="flex-1 overflow-y-auto">
            <QuickActions
              onActionSelect={(query) =>
                append({ content: query, role: "user" })
              }
            />
          </div>
        </div>

        {/* This is the header section */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-payman-neutral/30">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="text-center flex justify-between items-center">
                <h1 className="text-5xl font-bold text-charcoal-700 tracking-tight">
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
                <div className="flex items-center space-x-3">
                  <div className="">
                    {isLiveMode ? (
                      <div className="animate-pulse">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-300 shadow-sm shadow-green-100">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                          Live payments enabled
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Done moving monopoly money? Enable live mode
                      </p>
                    )}
                  </div>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={isLiveMode}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShowLiveModeModal(true);
                        } else {
                          setIsLiveMode(false);
                          localStorage.setItem("paymanMode", "test");
                        }
                      }}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white shadow-md appearance-none cursor-pointer transition-transform duration-300 ease-in-out"
                    />
                    {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                    <label
                      className={`toggle-label block h-6 overflow-hidden rounded-full cursor-pointer transition-all duration-300 ease-in-out ${
                        isLiveMode ? "bg-payman-primary" : "bg-gray-200"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <ChatInterface
              messages={messages}
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              handleInputKeyDown={handleInputKeyDown}
              messagesEndRef={messagesEndRef}
              error={error}
              isLoading={isLoading}
            />
            <ToolCallsPanel
              messages={messages}
              toolCallsEndRef={toolCallsEndRef}
              getApiInfo={getApiInfo}
              formatToolCallResult={formatToolCallResult}
              addToolResult={addToolResult}
            />
          </div>
        </div>
      </main>

      {/* Live Mode Confirmation Modal */}
      {showLiveModeModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-payman-primary to-payman-primary/70 flex items-center justify-center shadow-xl shadow-payman-primary/30">
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  🚀 Hold Up Crazy B*stard!
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Well, well, well… looks like you’re about to trust an AI
                    with your hard-earned cash. Bold move, my friend—next stop:
                    letting it name your firstborn. Are you ready to live life
                    on the wild side?
                  </p>
                  <ul className="text-left text-sm space-y-3">
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-payman-primary rounded-full mr-3" />
                      Your transactions will be smoother than a buttered penguin
                      on ice
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-payman-primary rounded-full mr-3" />
                      Real cash moves, because playing in the kiddie pool is for
                      amateurs
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-payman-primary rounded-full mr-3" />
                      Your accountant's about to call it quits (or demand hazard
                      pay)
                    </li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-4 italic">
                    It's not too late to back out... but where's the fun in
                    that? 😎
                  </p>
                </div>
              </div>

              <div className="flex flex-col w-full space-y-3 pt-4">
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                  onClick={() => {
                    setIsLiveMode(true);
                    setShowLiveModeModal(false);
                  }}
                  className="w-full px-6 py-4 bg-payman-primary text-white rounded-xl hover:bg-payman-primary/90 transition-all duration-300 font-medium shadow-lg shadow-payman-primary/20"
                >
                  Let’s Ruin My Accountant’s Life! 🚀
                </button>
                {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                <button
                  onClick={() => {
                    setIsLiveMode(false);
                    setShowLiveModeModal(false);
                  }}
                  className="w-full px-6 py-4 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-all duration-300"
                >
                  Maybe I'll Stick to Monopoly Money 😅
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
