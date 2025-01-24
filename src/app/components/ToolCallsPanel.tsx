import type React from "react";
import type { Message } from "ai/react";
import type { ToolCallsPanelProps, ToolInvocation } from "./types";

interface ToolCallResultProps {
  toolInvocation: ToolInvocation;
  formatToolCallResult: (result: string) => React.ReactNode;
}

const ToolCallResult: React.FC<{
  toolInvocation: ToolInvocation;
  formatToolCallResult: (result: string) => React.ReactNode;
}> = ({ toolInvocation, formatToolCallResult }: ToolCallResultProps) => {
  const renderStatus = () => {
    try {
      const result = JSON.parse(toolInvocation.result || "");
      if (result.error) {
        return (
          <span className="text-xs font-medium px-3 py-1 rounded-md ml-3 bg-red-100 text-red-700">
            Failed
          </span>
        );
      }
      return (
        <span className="text-xs font-medium px-3 py-1 rounded-md ml-3 bg-green-100 text-green-700">
          200 OK
        </span>
      );
    } catch {
      return toolInvocation.result === null ? (
        <span className="text-xs font-medium px-3 py-1 rounded-md ml-3 bg-red-100 text-red-700">
          Failed
        </span>
      ) : (
        <span className="text-xs font-medium px-3 py-1 rounded-md ml-3 bg-green-100 text-green-700">
          200 OK
        </span>
      );
    }
  };

  const renderResult = () => {
    try {
      const result = JSON.parse(toolInvocation.result || "");
      if (result.error) {
        return (
          <div className="text-red-600 text-sm">Error: {result.error}</div>
        );
      }
      return formatToolCallResult(toolInvocation.result || "");
    } catch {
      return formatToolCallResult(toolInvocation.result || "");
    }
  };

  return (
    <>
      {"result" in toolInvocation ? (
        <>
          {renderStatus()}
          <div className="p-4">{renderResult()}</div>
        </>
      ) : (
        <div className="animate-pulse flex space-x-1">
          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
        </div>
      )}
    </>
  );
};

export function ToolCallsPanel({
  messages,
  toolCallsEndRef,
  getApiInfo,
  formatToolCallResult,
  addToolResult,
}: ToolCallsPanelProps) {
  return (
    <div className="w-[400px] border-l border-gray-200 bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <div className="p-4 bg-payman-primary/5 border-b border-payman-primary/20">
        <div className="flex items-center space-x-3">
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg
            className="w-5 h-5 text-payman-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <div>
            <h2 className="text-sm font-medium text-gray-900">Tool Calls</h2>
            <p className="text-xs text-gray-700 mt-0.5">
              System operations and responses
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m: Message) =>
          m.toolInvocations?.map((toolInvocation: ToolInvocation) => {
            const toolCallId = toolInvocation.toolCallId;
            const { method, endpoint } = getApiInfo(toolInvocation.toolName);

            if (toolInvocation.toolName === "confirmPayment") {
              return (
                <div
                  key={toolCallId}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
                >
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${
                          method === "GET"
                            ? "bg-blue-100 text-blue-700"
                            : method === "POST"
                            ? "bg-green-100 text-green-700"
                            : method === "PUT"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {method}
                      </span>
                      <span className="font-mono text-sm text-gray-600">
                        {endpoint}
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    <div className="p-4">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16l-4-4m0 0l4-4m-4 4h18"
                          />
                        </svg>
                        Request
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                        <pre className="whitespace-pre-wrap break-words">
                          {JSON.stringify(toolInvocation.args, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {toolInvocation.result !== undefined && (
                      <div className="p-4">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                          <div className="flex items-center">
                            {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                            <svg
                              className="w-4 h-4 mr-1.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            Response
                          </div>
                          {toolInvocation.result === null ? (
                            <span className="text-xs font-medium px-3 py-1 rounded-md bg-red-100 text-red-700">
                              Failed
                            </span>
                          ) : (
                            <span className="text-xs font-medium px-3 py-1 rounded-md bg-green-100 text-green-700">
                              200 OK
                            </span>
                          )}
                        </div>
                        {toolInvocation.result && (
                          <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                            {formatToolCallResult(toolInvocation.result)}
                          </div>
                        )}
                      </div>
                    )}

                    {toolInvocation.result === null && (
                      <div className="px-4 py-3 bg-red-50 border-t border-red-100">
                        <div className="flex items-center">
                          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                          <svg
                            className="w-4 h-4 text-red-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm text-red-700">
                            Tool call failed or returned no result
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={toolCallId}
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200"
              >
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide ${
                        method === "GET"
                          ? "bg-blue-100 text-blue-700"
                          : method === "POST"
                          ? "bg-green-100 text-green-700"
                          : method === "PUT"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {method}
                    </span>
                    <span className="font-mono text-sm text-gray-600">
                      {endpoint}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  <div className="p-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16l-4-4m0 0l4-4m-4 4h18"
                        />
                      </svg>
                      Request
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                      <pre className="whitespace-pre-wrap break-words">
                        {JSON.stringify(toolInvocation.args, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {toolInvocation.result !== undefined && (
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                          <svg
                            className="w-4 h-4 mr-1.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          Response
                        </div>
                        {toolInvocation.result === null ? (
                          <span className="text-xs font-medium px-3 py-1 rounded-md bg-red-100 text-red-700">
                            Failed
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-3 py-1 rounded-md bg-green-100 text-green-700">
                            200 OK
                          </span>
                        )}
                      </div>
                      {toolInvocation.result && (
                        <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm">
                          {formatToolCallResult(toolInvocation.result)}
                        </div>
                      )}
                    </div>
                  )}

                  {toolInvocation.result === null && (
                    <div className="px-4 py-3 bg-red-50 border-t border-red-100">
                      <div className="flex items-center">
                        {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                        <svg
                          className="w-4 h-4 text-red-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm text-red-700">
                          Tool call failed or returned no result
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={toolCallsEndRef} />
      </div>
    </div>
  );
}
