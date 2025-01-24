import type React from "react";
import { useState } from "react";
import type { PayeeFormProps } from "../types";

export function PayeeForm({
  toolCallId,
  args,
  onComplete,
  onCancel,
}: PayeeFormProps) {
  const [name, setName] = useState(args.name?.toString() || "");
  const [email, setEmail] = useState(args.email?.toString() || "");
  const [type, setType] = useState(args.type?.toString() || "US_ACH");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(
      JSON.stringify({
        name,
        email,
        type,
      })
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Payee</h3>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-payman-primary focus:ring-payman-primary sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-payman-primary focus:ring-payman-primary sm:text-sm"
          required
        />
      </div>

      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Payment Type
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-payman-primary focus:ring-payman-primary sm:text-sm"
        >
          <option value="US_ACH">US ACH</option>
          <option value="WIRE">Wire Transfer</option>
          <option value="SEPA">SEPA</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-payman-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-payman-primary border border-transparent rounded-md hover:bg-payman-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-payman-primary"
        >
          Add Payee
        </button>
      </div>
    </form>
  );
}
