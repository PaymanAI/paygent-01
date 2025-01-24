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
  const [error, setError] = useState<string | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("paymanApiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Handle API key changes
  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
    if (newApiKey) {
      localStorage.setItem("paymanApiKey", newApiKey);
    } else {
      localStorage.removeItem("paymanApiKey");
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
    headers: {
      Authorization: `Bearer ${
        apiKey || process.env.NEXT_PUBLIC_PAYMAN_API_KEY
      }`,
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
      if (
        message.content &&
        message.content.trim() !== "" &&
        !message.content.includes("Sorry, there was an error")
      ) {
        setError(null);
      }
    },
    onError(error) {
      // Only set the error state, don't append to chat
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
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
    <main className="flex h-screen bg-gray-50">
      <div className="w-[300px] border-r border-gray-200 bg-white flex flex-col">
        <ConfigSection apiKey={apiKey} setApiKey={handleApiKeyChange} />
        <QuickActions
          onActionSelect={(query) => append({ content: query, role: "user" })}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              AI Payment Assistant
            </h1>
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
  );
}
