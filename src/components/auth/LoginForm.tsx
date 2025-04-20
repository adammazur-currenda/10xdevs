import React, { useState } from "react";
import { Form } from "../Form";
import { Input } from "../Input";
import { Button } from "../Button";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setIsLoading(true);

    try {
      // Wywołaj endpoint API logowania
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Dodaj nagłówek Cache-Control aby zapobiec cachowaniu
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify({ email, password }),
        // Dodaj credentials aby wysłać ciasteczka
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to parse response" }));
        throw new Error(data.error || "Failed to login");
      }

      // Po udanym logowaniu przekieruj na /audits
      window.location.href = "/audits";
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mt-8 space-y-6" data-test-id="login-form">
      <div className="space-y-4">
        <Input
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          autoComplete="email"
          error={error}
          data-test-id="login-email-input"
        />
        <Input
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          data-test-id="login-password-input"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <a href="/auth/reset-password" className="text-blue-600 hover:text-blue-500">
            Forgot your password?
          </a>
        </div>
        <div className="text-sm">
          <a href="/auth/register" className="text-blue-600 hover:text-blue-500">
            Create an account
          </a>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading} data-test-id="login-submit-button">
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </Form>
  );
};

export default LoginForm;
