import React, { useState, useEffect } from "react";
import type { ConfigSectionProps } from "./types";
import { toast } from "react-hot-toast";

export function ConfigSection({ apiKey, setApiKey }: ConfigSectionProps) {
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("paymanApiKey");
    setIsKeySaved(!!savedKey);
  }, []);

  return (
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Configuration
      </h2>

      <div className="mb-6 p-4 bg-gradient-to-r from-payman-primary/5 to-payman-primary/10 rounded-lg border border-payman-neutral/20 shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900">
            Get Started with Payman
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          To use this AI Agent, you'll need a Payman Cash Account. Get your API
          key by signing up or logging in.
        </p>
        <a
          href="https://app.paymanai.com/auth/sign-in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-payman-primary rounded-md hover:bg-payman-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-payman-primary/30 transition-colors duration-150"
        >
          Go to Payman
          {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
          <svg
            className="ml-2 -mr-1 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="apiKey"
          className="block text-xs font-medium text-gray-700"
        >
          API Key
        </label>
        <div className="space-y-2">
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const trimmedValue = e.currentTarget.value.trim();
                setApiKey(trimmedValue);
              }
            }}
            onBlur={(e) => {
              // Trim whitespace when user finishes typing
              const trimmedValue = e.target.value.trim();
              if (trimmedValue !== e.target.value) {
                setApiKey(trimmedValue);
              }
            }}
            className="w-full px-3 py-2 border border-payman-neutral/50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-payman-primary/30 focus:border-payman-primary/50"
            placeholder="Enter your API key"
            autoComplete="off"
            spellCheck="false"
          />
          {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
          <button
            onClick={() => {
              const trimmedValue = apiKey.trim();
              if (!trimmedValue) {
                setError("Please enter an API key");
                setIsKeySaved(false);
                localStorage.removeItem("paymanApiKey");
                toast.error("Please enter an API key");
                return;
              }
              setError("");
              setApiKey(trimmedValue);
              localStorage.setItem("paymanApiKey", trimmedValue);
              setIsKeySaved(true);
              toast.success("API key saved successfully");
            }}
            className="w-full px-4 py-2 bg-payman-primary text-white rounded-md hover:bg-payman-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-payman-primary/30 transition-colors duration-150 text-sm font-medium"
          >
            Save Key
          </button>
          {error && (
            <div className="mt-2 flex justify-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {error}
              </span>
            </div>
          )}
          {isKeySaved && !error && (
            <div className="mt-2 flex justify-center">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Key Saved
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
