import React, { useState, useEffect } from "react";
import type { ConfigSectionProps } from "./types";
import { toast } from "react-hot-toast";

export function ConfigSection({ apiKey, setApiKey }: ConfigSectionProps) {
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [error, setError] = useState("");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [showLiveModeModal, setShowLiveModeModal] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("paymanApiKey");
    const savedMode = localStorage.getItem("paymanMode");
    setIsKeySaved(!!savedKey);
    if (savedMode === "live") setIsLiveMode(true);
  }, []);

  const handleSaveKey = () => {
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
    localStorage.setItem("paymanMode", isLiveMode ? "live" : "test");
    setIsKeySaved(true);
    toast.success("Settings saved successfully");
  };

  const handleModeToggle = (newMode: boolean) => {
    if (newMode) {
      setShowLiveModeModal(true);
    } else {
      setIsLiveMode(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto p-6 border-b border-gray-200 bg-gradient-to-br from-gray-50 to-white">
      <h2 className="text-base font-semibold text-gray-900 mb-4">
        Configuration
      </h2>

      <div className="space-y-4">
        {/* Info Section */}
        <div className="p-4 bg-payman-primary/5 rounded-xl border border-payman-primary/20">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
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
              <h3 className="text-sm font-medium text-gray-900">
                Get Your AI Cash Account
              </h3>
              <p className="mt-1 text-xs text-gray-700">
                Sign up at{" "}
                <a
                  href="https://app.paymanai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-payman-primary hover:text-payman-primary/80 underline"
                >
                  app.paymanai.com
                </a>{" "}
                to create your AI Cash Account and get your API key. Your key
                lets you spend money right from this app!
              </p>
            </div>
          </div>
        </div>

        {/* API Key Input */}
        <div className="p-4 bg-white/80 rounded-xl shadow-sm border border-gray-100">
          <label
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-800 mb-2"
          >
            Payman API Key
          </label>
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
              const trimmedValue = e.target.value.trim();
              if (trimmedValue !== e.target.value) {
                setApiKey(trimmedValue);
              }
            }}
            className="w-full px-3 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-payman-primary/30 focus:border-payman-primary transition-all duration-300"
            placeholder="Enter your API key"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        {/* Payment Mode Toggle */}
        <div className="p-4 bg-white/80 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
              <label className="text-sm font-medium text-gray-800">
                Move Real Money
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                {isLiveMode
                  ? "Live payments enabled"
                  : "You know you want to press it"}
              </p>
            </div>
            <div className="relative inline-block w-12 align-middle select-none">
              <input
                type="checkbox"
                checked={isLiveMode}
                onChange={(e) => handleModeToggle(e.target.checked)}
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

        {/* Save Button */}
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button
          onClick={handleSaveKey}
          className="w-full px-4 py-3 bg-payman-primary text-white rounded-lg hover:bg-payman-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-payman-primary/30 transition-all duration-300 text-sm font-medium shadow-lg shadow-payman-primary/20"
        >
          Save Configuration
        </button>

        {/* Status Messages */}
        {error && (
          <div className="flex justify-center">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-800 border border-red-100 shadow-sm">
              {error}
            </span>
          </div>
        )}
        {isKeySaved && !error && (
          <div className="flex justify-center">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-800 border border-green-100 shadow-sm">
              Configuration Saved
            </span>
          </div>
        )}
      </div>

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

      <style jsx>{`
        .toggle-checkbox:checked {
          transform: translateX(100%);
          border-color: #68d391;
        }
        .toggle-label {
          transition: all 0.3s ease-in-out;
        }
        .toggle-checkbox {
          transform: translateX(0);
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
