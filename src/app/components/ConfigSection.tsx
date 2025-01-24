import React, { useState, useEffect } from "react";
import type { ConfigSectionProps } from "./types";
import { toast } from "react-hot-toast";

export function ConfigSection({
  apiKey,
  setApiKey,
  provider,
  setProvider,
  paymanApiKey,
  setPaymanApiKey,
}: ConfigSectionProps) {
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [isPaymanKeySaved, setIsPaymanKeySaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedProvider =
      (localStorage.getItem("aiProvider") as "openai" | "anthropic") ||
      "openai";
    const savedKey = localStorage.getItem(`${savedProvider}ApiKey`);
    const savedPaymanKey = localStorage.getItem("paymanApiKey");

    setProvider(savedProvider);
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    }
    if (savedPaymanKey) {
      setPaymanApiKey(savedPaymanKey);
      setIsPaymanKeySaved(true);
    }
  }, [setApiKey, setProvider, setPaymanApiKey]);

  const handleSaveKey = () => {
    console.log("Save Keys button clicked");
    const trimmedValue = apiKey.trim();
    const trimmedPaymanValue = paymanApiKey.trim();

    if (!trimmedValue) {
      setError("Please enter an API key for the selected AI provider");
      setIsKeySaved(false);
      localStorage.removeItem(`${provider}ApiKey`);
      toast.error("Please enter an API key for the selected AI provider");
      return;
    }

    if (!trimmedPaymanValue) {
      setError("Please enter your Payman API key");
      setIsPaymanKeySaved(false);
      localStorage.removeItem("paymanApiKey");
      toast.error("Please enter your Payman API key");
      return;
    }

    setError("");
    setApiKey(trimmedValue);
    setPaymanApiKey(trimmedPaymanValue);
    localStorage.setItem(`${provider}ApiKey`, trimmedValue);
    localStorage.setItem("paymanApiKey", trimmedPaymanValue);
    localStorage.setItem("aiProvider", provider);
    setIsKeySaved(true);
    setIsPaymanKeySaved(true);
    toast.success("Settings saved successfully");
  };

  const handleProviderChange = (newProvider: "openai" | "anthropic") => {
    console.log("handleProviderChange called with:", newProvider);
    setProvider(newProvider);
    const savedKey = localStorage.getItem(`${newProvider}ApiKey`);
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySaved(true);
    } else {
      setApiKey("");
      setIsKeySaved(false);
    }
  };

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
              <p className="mt-0.5 text-xs text-gray-700">
                1. Choose your AI provider (OpenAI or Anthropic) and enter your
                API key.
              </p>
              <p className="mt-1 text-xs text-gray-700">
                2. Sign up at{" "}
                <a
                  href="https://app.paymanai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-payman-primary hover:text-payman-primary/80 underline"
                >
                  app.paymanai.com
                </a>{" "}
                to get your API key to give your Paygent a cash account.
              </p>
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="p-2 bg-white/80 rounded-lg shadow-sm border border-gray-100">
          {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block text-xs font-medium text-gray-800 mb-1.5">
            AI Provider
          </label>
          <div className="flex space-x-2">
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log("OpenAI button clicked");
                handleProviderChange("openai");
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 cursor-pointer z-10 relative ${
                provider === "openai"
                  ? "bg-payman-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              OpenAI
            </button>
            {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                console.log("Anthropic button clicked");
                handleProviderChange("anthropic");
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 cursor-pointer z-10 relative ${
                provider === "anthropic"
                  ? "bg-payman-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Anthropic
            </button>
          </div>
        </div>

        {/* AI Provider Key Input */}
        <div className="p-2 bg-white/80 rounded-lg shadow-sm border border-gray-100">
          <label
            htmlFor="apiKey"
            className="block text-xs font-medium text-gray-800 mb-1.5"
          >
            {provider === "openai" ? "OpenAI" : "Anthropic"} API Key
          </label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => {
              console.log("API key changed");
              setApiKey(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveKey();
              }
            }}
            onBlur={(e) => {
              const trimmedValue = e.target.value.trim();
              if (trimmedValue !== e.target.value) {
                setApiKey(trimmedValue);
              }
            }}
            className="w-full px-2 py-1.5 bg-gray-50/50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-payman-primary/30 focus:border-payman-primary transition-all duration-300"
            placeholder={`Enter your ${
              provider === "openai" ? "OpenAI" : "Anthropic"
            } API key`}
          />
        </div>

        {/* Payman API Key Input */}
        <div className="p-2 bg-white/80 rounded-lg shadow-sm border border-gray-100">
          <label
            htmlFor="paymanApiKey"
            className="block text-xs font-medium text-gray-800 mb-1.5"
          >
            Payman API Key
          </label>
          <input
            id="paymanApiKey"
            type="password"
            value={paymanApiKey}
            onChange={(e) => {
              console.log("Payman API key changed");
              setPaymanApiKey(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSaveKey();
              }
            }}
            onBlur={(e) => {
              const trimmedValue = e.target.value.trim();
              if (trimmedValue !== e.target.value) {
                setPaymanApiKey(trimmedValue);
              }
            }}
            className="w-full px-2 py-1.5 bg-gray-50/50 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-payman-primary/30 focus:border-payman-primary transition-all duration-300"
            placeholder="Enter your Payman API key"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSaveKey}
            className="px-3 py-1.5 bg-payman-primary text-white rounded-md text-xs font-medium hover:bg-payman-primary/90 transition-colors duration-300 cursor-pointer z-10 relative"
          >
            {isKeySaved && isPaymanKeySaved ? "Update Keys" : "Save Keys"}
          </button>
        </div>
      </div>
    </div>
  );
}
