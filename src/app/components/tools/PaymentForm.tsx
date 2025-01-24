import type React from "react";
import { useState } from "react";
import type { PaymentFormProps } from "../types";

export function PaymentForm({
  toolCallId,
  args,
  onComplete,
  onCancel,
}: PaymentFormProps) {
  const [amount, setAmount] = useState(args.amount?.toString() || "");
  const [currency, setCurrency] = useState(args.currency || "USD");
  const [description, setDescription] = useState(args.description || "");
  const [recipientEmail, setRecipientEmail] = useState(
    args.recipientEmail || ""
  );
  const [recipientName, setRecipientName] = useState(args.recipientName || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(
      JSON.stringify({
        amount: Number.parseFloat(amount),
        currency,
        description,
        recipientEmail,
        recipientName,
      })
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-payman-primary focus:ring-payman-primary"
          required
        />
      </div>
      {/* Add other fields */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-payman-primary text-white rounded-md hover:bg-payman-primary-dark"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
