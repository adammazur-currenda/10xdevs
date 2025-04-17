import { z } from "zod";

// Types and interfaces
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  top_p?: number;
}

export interface OpenRouterConfig {
  apiKey: string;
  endpointUrl: string;
  defaultModel: string;
  defaultParameters: {
    temperature: number;
    max_tokens: number;
  };
  responseFormat?: {
    type: string;
    schema: Record<string, unknown>;
  };
}

export interface FormattedPayload {
  messages: Message[];
  model: string;
  response_format?: Record<string, unknown>;
  stream?: boolean;
}

export interface RequestPayload extends FormattedPayload {
  temperature?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  top_p?: number;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: Message;
    finish_reason: string;
    index: number;
  }[];
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Validation schemas
const configSchema = z.object({
  apiKey: z.string().min(1),
  endpointUrl: z.string().url(),
  defaultModel: z.string().min(1),
  defaultParameters: z
    .object({
      temperature: z.number().min(0).max(2).optional(),
      max_tokens: z.number().positive().optional(),
      frequency_penalty: z.number().min(-2).max(2).optional(),
      presence_penalty: z.number().min(-2).max(2).optional(),
      top_p: z.number().min(0).max(1).optional(),
    })
    .optional(),
  responseFormat: z.record(z.unknown()).optional(),
});

interface APIError {
  status?: string;
  statusText?: string;
  message?: string;
}

export class OpenRouterService {
  private readonly config: OpenRouterConfig;

  constructor(config: OpenRouterConfig) {
    this.config = config;
  }

  async sendRequest(messages: Message[]): Promise<Response> {
    const response = await fetch(this.config.endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "HTTP-Referer": "https://github.com/10xdevs/10xdevs",
      },
      body: JSON.stringify({
        model: this.config.defaultModel,
        messages,
        ...this.config.defaultParameters,
        response_format: this.config.responseFormat,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    return response;
  }

  /**
   * Builds the request payload from the provided messages
   * @param messages Array of messages to format
   * @returns Formatted payload for the API request
   */
  private _buildPayload(messages: Message[]): RequestPayload {
    return {
      messages,
      model: this.config.defaultModel,
      response_format: this.config.responseFormat,
      ...this.config.defaultParameters,
    };
  }

  /**
   * Validates the response from the API
   * @param response Response data to validate
   * @returns boolean indicating if the response is valid
   */
  private _validateResponse(response: unknown): boolean {
    try {
      const schema = this.config.responseFormat?.schema;
      if (!schema) return true;

      const zodSchema = z.object(schema as z.ZodRawShape);
      zodSchema.parse(response);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Formats error responses
   * @param error Error to format
   * @returns Formatted error response
   */
  private _formatError(error: Error | APIError): ErrorResponse {
    const errorDetails: Record<string, unknown> = {};

    if (error instanceof Error) {
      errorDetails.name = error.name;
      errorDetails.message = error.message;
      errorDetails.stack = error.stack;
    } else {
      Object.entries(error).forEach(([key, value]) => {
        errorDetails[key] = value;
      });
    }

    return {
      code: (error as APIError).status || "UNKNOWN_ERROR",
      message: (error as APIError).statusText || (error as Error).message || "An unknown error occurred",
      details: errorDetails,
    };
  }

  /**
   * Logs errors for debugging and monitoring
   * @param error Error to log
   */
  private _logError(error: Error): void {
    console.error("[OpenRouterService]", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Formats system and user messages into a payload format
   * @param systemMessage The system message providing context and instructions
   * @param userMessage The user's input message
   * @returns Formatted payload ready for API request
   */
  public formatMessages(systemMessage: string, userMessage: string): FormattedPayload {
    const messages: Message[] = [
      {
        role: "system",
        content: systemMessage,
      },
      {
        role: "user",
        content: userMessage,
      },
    ];

    return this._buildPayload(messages);
  }

  /**
   * Updates the model parameters at runtime
   * @param parameters New parameters to set
   */
  public setModelParameters(parameters: ModelParameters): void {
    // Validate parameters using the same schema as in config
    const validatedParams = configSchema.shape.defaultParameters.unwrap().parse(parameters);

    // Update parameters
    this.config.defaultParameters = {
      ...this.config.defaultParameters,
      ...validatedParams,
    };
  }
}
