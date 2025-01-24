import type { Message } from "ai/react";
import type { ForwardRefExoticComponent, SVGProps } from "react";

export type ToolInvocation = {
  toolCallId: string;
  toolName: string;
  args?: Record<string, unknown>;
  result?: string;
};

export type QuickAction = {
  label: string;
  shortcut: string;
  query: string;
  icon: ForwardRefExoticComponent<SVGProps<SVGSVGElement>>;
};

export type ApiInfo = {
  method: string;
  endpoint: string;
};

export interface CollapsibleArrayItemProps {
  item: {
    id?: string;
    name?: string;
    type?: string;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    [key: string]: any; // Allow additional properties
  };
}

export interface ConfigSectionProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  provider: "openai" | "anthropic";
  setProvider: (provider: "openai" | "anthropic") => void;
  paymanApiKey: string;
  setPaymanApiKey: (key: string) => void;
}

export interface QuickActionsProps {
  onActionSelect: (query: string) => void;
}

export interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  error: string | null;
  isLoading: boolean;
}

export interface ToolCallsPanelProps {
  messages: Message[];
  toolCallsEndRef: React.RefObject<HTMLDivElement>;
  getApiInfo: (toolName: string) => ApiInfo;
  formatToolCallResult: (result: string) => React.ReactNode;
  addToolResult: (params: { toolCallId: string; result: string }) => void;
}

export enum InteractiveComponentType {
  PAYEE_SELECTOR = "PAYEE_SELECTOR",
  MONEY_TRANSFER = "MONEY_TRANSFER",
  MONEY_REQUEST = "MONEY_REQUEST",
}

export interface InteractiveComponentProps {
  type: InteractiveComponentType;
  toolCallId: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  onComplete: (data: any) => void;
  onCancel: () => void;
}

export interface PayeeSelectorProps extends InteractiveComponentProps {
  type: InteractiveComponentType.PAYEE_SELECTOR;
}

export interface MoneyTransferProps extends InteractiveComponentProps {
  type: InteractiveComponentType.MONEY_TRANSFER;
  payeeId?: string;
}

export interface MoneyRequestProps extends InteractiveComponentProps {
  type: InteractiveComponentType.MONEY_REQUEST;
  payeeId?: string;
}

export interface ToolComponentProps {
  toolCallId: string;
  args: Record<string, unknown>;
  onComplete: (result: string) => void;
  onCancel: () => void;
}

export interface PaymentFormProps extends ToolComponentProps {
  args: {
    amount?: number;
    currency?: string;
    description?: string;
    recipientEmail?: string;
    recipientName?: string;
  };
}

export interface PayeeFormProps extends ToolComponentProps {
  args: {
    name?: string;
    email?: string;
    type?: string;
  };
}
