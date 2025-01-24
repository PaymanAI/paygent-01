import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import Paymanai from "paymanai";

// Initialize Payman client
const client = new Paymanai({
  xPaymanAPISecret: process.env.PAYMAN_API_SECRET,
  environment: "sandbox",
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4-turbo"),
    system:
      "You are a helpful payment assistant. Help users understand and manage their payments, transactions, and financial queries. Use the available tools to interact with the payment system when needed.",
    messages,

    tools: {
      // Server-side payment tools
      initiatePayment: {
        description:
          "Start the process of making a payment by collecting necessary information",
        parameters: z.object({
          initialAmount: z
            .number()
            .optional()
            .describe("Initial amount if known"),
          recipientEmail: z
            .string()
            .optional()
            .describe("Recipient email if known"),
          description: z
            .string()
            .optional()
            .describe("Payment description if known"),
        }),
        execute: async ({ initialAmount, recipientEmail, description }) => {
          return JSON.stringify({
            type: "TOOL_FORM",
            toolName: "processPayment",
            args: {
              amount: initialAmount,
              recipientEmail,
              description,
            },
          });
        },
      },
      processPayment: {
        description: "Process a payment with complete information",
        parameters: z.object({
          amount: z.number().describe("The amount to pay"),
          currency: z.string().describe("The currency code (e.g., USD)"),
          description: z.string().describe("Description of the payment"),
          recipientEmail: z.string().describe("Email of the payment recipient"),
          recipientName: z
            .string()
            .optional()
            .describe("Name of the payment recipient"),
        }),
        execute: async ({
          amount,
          currency,
          description,
          recipientEmail,
          recipientName,
        }) => {
          try {
            const response = await client.payments.sendPayment({
              amountDecimal: amount,
              customerEmail: recipientEmail,
              customerName: recipientName,
              memo: description,
            });
            return `Payment of ${amount} ${currency} successfully processed for ${description}`;
          } catch (error) {
            console.error("Payment processing error:", error);
            throw new Error("Failed to process payment. Please try again.");
          }
        },
      },
      getBalance: {
        description: "Get the available balance",
        parameters: z.object({
          currency: z.string().describe("The currency code (e.g., USD)"),
        }),
        execute: async ({ currency }) => {
          try {
            const balance = await client.balances.getSpendableBalance(currency);
            return `Available balance: ${balance} ${currency}`;
          } catch (error) {
            console.error("Balance check error:", error);
            throw new Error("Failed to retrieve balance. Please try again.");
          }
        },
      },
      getPaymentHistory: {
        description: "Get the payment history for the user",
        parameters: z.object({
          limit: z
            .number()
            .optional()
            .describe("Number of transactions to return"),
          status: z.enum(["pending", "completed", "failed"]).optional(),
        }),
        execute: async ({ limit = 5, status }) => {
          // TODO: Implement actual history fetch with PaymanAI
          return `Last ${limit} payments retrieved${
            status ? ` with status ${status}` : ""
          }`;
        },
      },
      searchDestinations: {
        description: "Search for payment destinations",
        parameters: z.object({
          name: z
            .string()
            .optional()
            .describe("Name to filter by (partial match)"),
          contactEmail: z.string().optional().describe("Email to filter by"),
          type: z.string().optional().describe("Payment type (e.g., US_ACH)"),
        }),
        execute: async ({ name, contactEmail, type }) => {
          try {
            const destinations = await client.payments.searchDestinations({
              name,
              contactEmail,
              type,
            });
            return `Found destinations: ${JSON.stringify(destinations)}`;
          } catch (error) {
            console.error("Destination search error:", error);
            throw new Error("Failed to search destinations. Please try again.");
          }
        },
      },
      createPayee: {
        description: "Create a new ACH payee",
        parameters: z.object({
          name: z.string().describe("Full name of the payee"),
          accountNumber: z.string().describe("Bank account number"),
          routingNumber: z.string().describe("Bank routing number"),
          accountType: z.enum(["checking", "savings"]).describe("Account type"),
          email: z.string().describe("Contact email"),
          phoneNumber: z.string().describe("Contact phone number"),
          address: z.string().describe("Physical address"),
          taxId: z.string().describe("Tax ID (SSN/EIN)"),
        }),
        execute: async ({
          name,
          accountNumber,
          routingNumber,
          accountType,
          email,
          phoneNumber,
          address,
          taxId,
        }) => {
          try {
            const payee = await client.payments.createPayee({
              type: "US_ACH",
              name,
              accountHolderName: name,
              accountNumber,
              routingNumber,
              accountType,
              contactDetails: {
                contactType: "individual",
                email,
                phoneNumber,
                address,
                taxId,
              },
              tags: ["api_created"],
            });
            return `Successfully created payee: ${payee.name}`;
          } catch (error) {
            console.error("Payee creation error:", error);
            throw new Error("Failed to create payee. Please try again.");
          }
        },
      },
      initiateDeposit: {
        description: "Request money from someone",
        parameters: z.object({
          amount: z.number().describe("Amount to deposit"),
          customerId: z.string().describe("Customer ID"),
          customerEmail: z.string().optional().describe("Customer email"),
          customerName: z.string().optional().describe("Customer name"),
          memo: z.string().optional().describe("Deposit memo"),
        }),
        execute: async ({
          amount,
          customerId,
          customerEmail,
          customerName,
          memo,
        }) => {
          try {
            const response = await client.payments.initiateCustomerDeposit({
              amountDecimal: amount,
              customerId,
              customerEmail,
              customerName,
              memo,
            });
            return `Deposit initiated. Checkout URL: ${response.checkoutUrl}`;
          } catch (error) {
            console.error("Deposit initiation error:", error);
            throw new Error("Failed to initiate deposit. Please try again.");
          }
        },
      },
      // Client-side tools
      confirmPayment: {
        description: "Ask the user to confirm a payment before processing",
        parameters: z.object({
          amount: z.number(),
          currency: z.string(),
          description: z.string(),
        }),
      },
      getPaymentMethod: {
        description: "Get the user's preferred payment method",
        parameters: z.object({}),
      },
    },
  });

  return result.toDataStreamResponse();
}
