import type React from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "ai/react";
import type { ChatInterfaceProps } from "./types";
import { PaymentForm } from "./tools/PaymentForm";
import { PayeeForm } from "./tools/PayeeForm";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const ToolComponents: Record<string, React.ComponentType<any>> = {
  processPayment: PaymentForm,
  initiatePayment: PaymentForm,
  createPayee: PayeeForm,
};

export function ChatInterface({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  handleInputKeyDown,
  messagesEndRef,
  error,
  isLoading,
}: ChatInterfaceProps) {
  const renderMessageContent = (message: Message) => {
    console.log("Content:", message);

    if (!message.content) return null;

    // Try to parse as tool form
    try {
      const content = JSON.parse(message.content);
      console.log("Content:", message);
      if (content.type === "TOOL_FORM" && content.toolName in ToolComponents) {
        const Component = ToolComponents[content.toolName];
        return (
          <Component
            toolCallId={content.toolCallId}
            args={content.args}
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            onComplete={(result: any) => {
              // When form is completed, call processPayment with the collected data
              if (content.toolName === "processPayment") {
                const paymentData = JSON.parse(result);
                // Add default currency if not specified
                if (!paymentData.currency) {
                  paymentData.currency = "USD";
                }
                // TODO: Call processPayment with the complete data
                console.log("Processing payment with:", paymentData);
              }
            }}
            onCancel={() => {
              // TODO: Handle cancellation
              console.log("Form cancelled");
            }}
          />
        );
      }
    } catch {
      // Not a tool form, render as markdown
      return message.role === "user" ? (
        <div className="whitespace-pre-wrap text-[15px]">{message.content}</div>
      ) : (
        <div className="prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/80 prose-pre:text-sm">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-4 pb-8">
            {messages.map((m: Message) =>
              m.content ? (
                <div key={m.id} className="space-y-2">
                  <div
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`${
                        m.role === "user"
                          ? "bg-payman-primary text-white shadow-sm"
                          : "bg-payman-neutral text-payman-dark shadow-sm"
                      } rounded-2xl px-4 py-3 max-w-[85%] md:max-w-[75%] transition-colors`}
                    >
                      {renderMessageContent(m)}
                    </div>
                  </div>
                </div>
              ) : null
            )}
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
        <form onSubmit={handleSubmit} className="p-4 flex space-x-3">
          <input
            className="flex-1 px-4 py-3 border border-payman-neutral/50 rounded-2xl bg-payman-neutral/5 focus:outline-none focus:ring-2 focus:ring-payman-primary/30 focus:border-payman-primary/50 transition-all placeholder:text-gray-400"
            value={input}
            placeholder="Type your message... (try /who, /add, or /send)"
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-payman-primary text-white rounded-2xl hover:bg-payman-primary/90 focus:outline-none focus:ring-2 focus:ring-payman-primary/30 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
