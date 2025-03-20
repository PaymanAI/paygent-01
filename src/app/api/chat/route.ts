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
      ...(experimental_attachments && { experimental_attachments }),
      tools: {
        sendPayment: {
          description: "Send a payment using Payman",
          parameters: z.object({
            amountDecimal: z
              .number()
              .describe("Amount in decimal format (e.g., 50.00)"),
            payeeId: z
              .string()
              .describe("ID of the payment destination"),
            memo: z
              .string()
              .optional()
              .describe("Optional payment memo/description"),
          }),
          execute: async ({
            amountDecimal,
            payeeId,
            memo,
          }) => {
            try {
              console.log("Sending payment with parameters:", {
                amountDecimal,
                payeeId,
                memo
              });
              
              // Create request payload
              const requestBody = {
                amountDecimal,
                payeeId,
                memo,
              };
              
              console.log("Payment request body:", JSON.stringify(requestBody, null, 2));
              
              // Set up API call options
              const apiUrl = `https://agent.${environment === "production" ? "" : "sandbox."}payman.ai/api/payments/send-payment`;
              const options = {
                method: 'POST',
                headers: {
                  'x-payman-api-secret': paymanApiKey || process.env.PAYMAN_API_SECRET || "",
                  'Content-Type': 'application/json',
                  'Accept': 'application/vnd.payman.v1+json'
                },
                body: JSON.stringify(requestBody)
              };
              
              console.log("Making API call to:", apiUrl);
              
              // Make the API call
              const response = await fetch(apiUrl, options);
              const responseData = await response.json();
              
              console.log("Payment API response status:", response.status);
              console.log("Payment API response:", responseData);
              
              // Check for success response
              if (!response.ok) {
                throw new Error(`API responded with status ${response.status}: ${JSON.stringify(responseData)}`);
              }
              
              return `Payment sent successfully! Payment ID: ${responseData.reference}`;
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Payment error:", error);
              
              // Try to provide a more helpful error message
              const errorMessage = error.message || "Unknown error";
              return `Error: Failed to send payment - ${errorMessage}`;
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
              console.log("Getting balance for currency:", currency);
              
              // Set up API call options
              const apiUrl = `https://agent.${environment === "production" ? "" : "sandbox."}payman.ai/api/balances/currencies/${currency}`;
              const options = {
                method: 'GET',
                headers: {
                  'x-payman-api-secret': paymanApiKey || process.env.PAYMAN_API_SECRET || "",
                  'Accept': 'application/vnd.payman.v1+json',
                  'Content-Type': 'application/json'
                }
              };
              
              console.log("Making API call to:", apiUrl);
              
              // Make the API call
              const response = await fetch(apiUrl, options);
              const responseData = await response.json();
              
              console.log("Balance API response status:", response.status);
              console.log("Balance API response:", responseData);
              
              // Check for success response
              if (!response.ok) {
                throw new Error(`API responded with status ${response.status}: ${JSON.stringify(responseData)}`);
              }
              
              // Extract the spendable balance from the response
              const spendableBalance = responseData;
              
              return `Available balance: ${spendableBalance} ${currency}`;
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Balance check error:", error);
              
              // Try to provide a more helpful error message
              const errorMessage = error.message || "Unknown error";
              return `Error: Failed to retrieve balance - ${errorMessage}`;
            }
          },
        },
        searchPayees: {
          description: "Search for payment destinations",
          parameters: z.object({
            name: z
              .string()
              .optional()
              .describe("The name of the payee to search for. This can be a partial, case-insensitive match."),
            contactEmail: z.string().optional().describe("The contact email to search for."),
            contactPhoneNumber: z.string().optional().describe("The contact phone number to search for."),
            contactTaxId: z.string().optional().describe("The contact tax id to search for."),
          }),
          execute: async ({ name, contactEmail, contactPhoneNumber, contactTaxId }) => {
            try {
              console.log("Searching payees with parameters:", { 
                name, 
                contactEmail, 
                contactPhoneNumber, 
                contactTaxId 
              });
              
              // Build query parameters if any are provided
              const queryParams = new URLSearchParams();
              if (name) queryParams.append('name', name);
              if (contactEmail) queryParams.append('contactEmail', contactEmail);
              if (contactPhoneNumber) queryParams.append('contactPhoneNumber', contactPhoneNumber);
              if (contactTaxId) queryParams.append('contactTaxId', contactTaxId);
              
              const queryString = queryParams.toString();
              const apiUrl = `https://agent.${environment === "production" ? "" : "sandbox."}payman.ai/api/payments/search-payees${queryString ? `?${queryString}` : ''}`;
              
              console.log("Making API call to:", apiUrl);
              
              // Set up API call options - simplified to match the example
              const options = {
                method: 'GET',
                headers: {
                  'x-payman-api-secret': paymanApiKey || process.env.PAYMAN_API_SECRET || "",
                  'Accept': 'application/vnd.payman.v1+json',
                  'Content-Type': 'application/json'
                }
              };
              
              // Make the API call
              const response = await fetch(apiUrl, options);
              const responseData = await response.json();
              
              console.log("Search API response status:", response.status);
              console.log("Search API response:", responseData);
              
              // Check for success response
              if (!response.ok) {
                throw new Error(`API responded with status ${response.status}: ${JSON.stringify(responseData)}`);
              }
              
              return `Found payees: ${JSON.stringify(responseData)}`;
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Payee search error:", error);
              
              // Try to provide a more helpful error message
              const errorMessage = error.message || "Unknown error";
              return `Error: Failed to search payees - ${errorMessage}`;
            }
          },
        },
        createPayee: {
          description: "Create a new payee",
          parameters: z.object({
            type: z
              .enum(["US_ACH", "CRYPTO_ADDRESS"])
              .describe("Type of payee (bank account or crypto address)"),
            name: z.string().describe("Name of the payee"),
            // Parameters for US_ACH type
            accountNumber: z.string().optional().describe("Bank account number (for US_ACH)"),
            routingNumber: z.string().optional().describe("Bank routing number (for US_ACH)"),
            accountType: z
              .enum(["checking", "savings"])
              .optional()
              .describe("Account type (for US_ACH)"),
            // Parameters for CRYPTO_ADDRESS type
            address: z.string().optional().describe("Crypto wallet address (for CRYPTO_ADDRESS)"),
            chain: z.string().optional().describe("Blockchain network (for CRYPTO_ADDRESS)"),
            currency: z.string().optional().describe("Cryptocurrency code (for CRYPTO_ADDRESS)"),
            // Contact details
            email: z.string().optional().describe("Contact email"),
            phoneNumber: z.string().optional().describe("Contact phone number"),
            taxId: z.string().optional().describe("Tax ID (SSN/EIN)"),
            // Address details
            addressLine1: z.string().optional().describe("Address line 1"),
            addressLine2: z.string().optional().describe("Address line 2"),
            locality: z.string().optional().describe("City/locality"),
            region: z.string().optional().describe("State/region"),
            postcode: z.string().optional().describe("ZIP/postal code"),
            country: z.string().optional().describe("Country code"),
            // Tags
            tags: z.array(z.string()).optional().describe("Tags for categorizing the payee"),
          }),
          execute: async ({
            type,
            name,
            accountNumber,
            routingNumber,
            accountType,
            address,
            chain,
            currency,
            email,
            phoneNumber,
            taxId,
            addressLine1,
            addressLine2,
            locality,
            region,
            postcode,
            country,
            tags,
          }) => {
            try {
              console.log("Creating payee with parameters:", {
                type,
                name,
                ...(type === "US_ACH" ? { accountNumber, routingNumber, accountType } : {}),
                ...(type === "CRYPTO_ADDRESS" ? { address, chain, currency } : {}),
                email,
                phoneNumber,
                taxId,
                addressDetails: {
                  addressLine1,
                  addressLine2,
                  locality,
                  region,
                  postcode,
                  country,
                },
                tags,
              });
              
              // Prepare request body based on payee type
              let requestBody: any = {
                type,
                name,
                tags: tags || [],
                contactDetails: {
                  email,
                  phoneNumber,
                  taxId,
                  address: (addressLine1 || addressLine2 || locality || region || postcode || country) ? {
                    addressLine1,
                    addressLine2,
                    locality,
                    region,
                    postcode,
                    country,
                  } : undefined,
                },
              };
              
              // Add type-specific fields
              if (type === "US_ACH") {
                requestBody = {
                  ...requestBody,
                  accountHolderName: name,
                  accountNumber,
                  routingNumber,
                  accountType,
                };
              } else if (type === "CRYPTO_ADDRESS") {
                requestBody = {
                  ...requestBody,
                  address,
                  chain,
                  currency,
                };
              }
              
              // Clean up undefined values
              requestBody = JSON.parse(JSON.stringify(requestBody));
              
              console.log("Create payee request body:", JSON.stringify(requestBody, null, 2));
              
              // Set up API call options
              const apiUrl = `https://agent.${environment === "production" ? "" : "sandbox."}payman.ai/api/payments/payees`;
              const options = {
                method: 'POST',
                headers: {
                  'x-payman-api-secret': paymanApiKey || process.env.PAYMAN_API_SECRET || "",
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
              };
              
              console.log("Making API call to:", apiUrl);
              
              // Make the API call
              const response = await fetch(apiUrl, options);
              const responseData = await response.json();
              
              console.log("Create payee API response status:", response.status);
              console.log("Create payee API response:", responseData);
              
              // Check for success response
              if (!response.ok) {
                throw new Error(`API responded with status ${response.status}: ${JSON.stringify(responseData)}`);
              }
              
              return `Successfully created payee: ${responseData.id}`;
              // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            } catch (error: any) {
              console.error("Payee creation error:", error);
              
              // Try to provide a more helpful error message
              const errorMessage = error.message || "Unknown error";
              return `Error: Failed to create payee - ${errorMessage}`;
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
