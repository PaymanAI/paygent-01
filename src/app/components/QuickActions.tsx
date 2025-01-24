import React from "react";
import type { QuickAction, QuickActionsProps } from "./types";
import {
  UserGroupIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  WalletIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

export const quickActions: QuickAction[] = [
  {
    label: "Who can my AI pay?",
    shortcut: "/who",
    query: "Show me who I can pay",
    icon: UserGroupIcon,
  },
  {
    label: "Add a payee",
    shortcut: "/add",
    query: "I want to add a new payee",
    icon: UserPlusIcon,
  },
  {
    label: "Send money",
    shortcut: "/send",
    query: "I want to send money",
    icon: CurrencyDollarIcon,
  },
  {
    label: "Check balance",
    shortcut: "/balance",
    query: "What's my current balance?",
    icon: WalletIcon,
  },
  {
    label: "Request money",
    shortcut: "/request",
    query: "I want to request money from someone",
    icon: HandRaisedIcon,
  },
];

export function QuickActions({ onActionSelect }: QuickActionsProps) {
  return (
    <div className="flex-1 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">
        Available Shortcuts
      </h2>
      <div className="space-y-3">
        {quickActions.map((action) => (
          // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
          <div
            key={action.shortcut}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => onActionSelect(action.query)}
          >
            <div className="flex items-center gap-3 mb-1">
              <action.icon className="w-4 h-4 text-payman-primary" />
              <span className="font-medium text-sm text-gray-900">
                {action.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Type</span>
              <code className="text-xs font-mono font-medium text-payman-primary bg-payman-primary/5 px-2 py-1 rounded tracking-wide">
                {action.shortcut}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
