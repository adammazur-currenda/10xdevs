import React, { useState } from "react";
import { Form } from "../Form";
import { Input } from "../Input";
import { Button } from "../Button";

export const ResetPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify({ email }),
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to parse response" }));
        throw new Error(data.error || "Failed to send reset password email");
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Check your email</h3>
        <p className="mt-2 text-sm text-gray-600">
          We&apos;ve sent you a link to reset your password. Please check your inbox and follow the instructions.
        </p>
        <Button type="button" className="mt-4" onClick={() => (window.location.href = "/auth/login")}>
          Return to login
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
        />
      </div>

      <div className="text-sm text-center">
        <p className="text-gray-600">
          Remember your password?{" "}
          <a href="/auth/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending reset link..." : "Send reset link"}
      </Button>
    </Form>
  );
};

export default ResetPasswordForm;
