import React, { useState } from "react";
import { Form } from "../Form";
import { Input } from "../Input";
import { Button } from "../Button";

interface ResetPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSubmit(email);
      setIsSuccess(true);
    } catch (err) {
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
          We've sent you a link to reset your password. Please check your inbox and follow the instructions.
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
