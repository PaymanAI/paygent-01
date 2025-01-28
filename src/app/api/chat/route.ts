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
    const { messages, provider, experimental_attachments } = await req.json();
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
        "You are a helpful payment assistant. Help users understand and manage their payments, transactions, and financial queries. You can also analyze images and documents they share. Use the available tools to interact with the payment system when needed.",
      messages,
      experimental_attachments,
      tools: {
        sendPayment: {
          description: "Send a payment using Payman",
          parameters: z.object({
            amountDecimal: z
              .number()
              .describe("Amount in decimal format (e.g., 50.00)"),
            paymentDestinationId: z
              .string()
              .describe("ID of the payment destination"),
            customerId: z.string().optional().describe("Optional customer ID"),
            customerEmail: z
              .string()
              .optional()
              .describe("Optional customer email"),
            customerName: z
              .string()
              .optional()
              .describe("Optional customer name"),
            memo: z
              .string()
              .optional()
              .describe("Optional payment memo/description"),
          }),
          execute: async ({
            amountDecimal,
            paymentDestinationId,
            customerId,
            customerEmail,
            customerName,
            memo,
          }) => {
            if (!client) {
              throw new Error("Payman client not initialized");
            }

            try {
              const payment = await client.payments.sendPayment({
                amountDecimal,
                paymentDestinationId,
                customerId,
                customerEmail,
                customerName,
                memo,
              });

              return `Payment sent successfully! Payment ID: ${payment}`;
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              throw new Error(`Failed to send payment: ${error.message}`);
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
            email: z.string().optional().describe("Contact email"),
            phoneNumber: z.string().optional().describe("Contact phone number"),
            address: z.string().optional().describe("Physical address"),
            taxId: z.string().optional().describe("Tax ID (SSN/EIN)"),
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
              const payeeId = JSON.parse(`${payee}`).id;
              return `Successfully created payee: ${payeeId}`;
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

              const checkoutUrl = JSON.parse(`${response}`).checkoutUrl;

              return `Deposit initiated. Checkout URL: ${checkoutUrl}`;
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Deposit initiation error:", error);
              return `Error: Failed to initiate deposit - ${error.message}`;
            }
          },
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
