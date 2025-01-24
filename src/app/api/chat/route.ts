import { streamText } from "ai";
import { z } from "zod";
import Paymanai from "paymanai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, provider } = await req.json();
    const apiKey = req.headers.get("authorization")?.replace("Bearer ", "");
    const paymanApiKey = req.headers.get("x-payman-api-key");
    const environment = req.headers.get("x-payman-environment") || "sandbox";

    console.log("API Key:", apiKey);
    console.log("Payman API Key:", paymanApiKey);
    console.log("Environment:", environment);

    if (!apiKey) {
      return new Response("Missing API key", { status: 401 });
    }

    // Initialize Payman client with the API key from headers
    const client = new Paymanai({
      xPaymanAPISecret: paymanApiKey || process.env.PAYMAN_API_SECRET,
      environment: environment as "sandbox" | "production",
    });

    const openaiClient = createOpenAI({
      apiKey,
      compatibility: "strict",
    });

    const anthropicClient = createAnthropic({
      apiKey,
    });

    const result = streamText({
      model:
        provider === "openai"
          ? openaiClient("gpt-4-turbo")
          : anthropicClient("claude-3-5-sonnet-20241022"),
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
            recipientEmail: z
              .string()
              .describe("Email of the payment recipient"),
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
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Payment processing error:", error);
              return `Error: Failed to process payment - ${error.message}`;
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
              const balance = await client.balances.getSpendableBalance(
                currency
              );
              return `Available balance: ${balance} ${currency}`;
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Balance check error:", error);
              return `Error: Failed to retrieve balance - ${error.message}`;
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
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Destination search error:", error);
              return `Error: Failed to search destinations - ${error.message}`;
            }
          },
        },
        createPayee: {
          description: "Create a new ACH payee",
          parameters: z.object({
            name: z.string().describe("Full name of the payee"),
            accountNumber: z.string().describe("Bank account number"),
            routingNumber: z.string().describe("Bank routing number"),
            accountType: z
              .enum(["checking", "savings"])
              .describe("Account type"),
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
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Payee creation error:", error);
              return `Error: Failed to create payee - ${error.message}`;
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
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Deposit initiation error:", error);
              return `Error: Failed to initiate deposit - ${error.message}`;
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
  } catch (error) {
    console.error("Route handler error:", error);
    // Always return a Response, even in error cases
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
