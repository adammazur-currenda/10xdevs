import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Setup global mocks
// Example: vi.stubGlobal('localStorage', {
//   getItem: vi.fn(),
//   setItem: vi.fn(),
//   removeItem: vi.fn(),
//   clear: vi.fn(),
// });

// Mock Supabase client using MSW
export const handlers = [
  http.get("https://api.supabase.co/*", () => {
    return HttpResponse.json({ message: "Mocked API response" });
  }),
  // Add more handlers as needed for your API endpoints
];

// Setup MSW server
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset handlers after each test (important for test isolation)
afterEach(() => server.resetHandlers());

// Clean up after all tests are done
afterAll(() => server.close());
