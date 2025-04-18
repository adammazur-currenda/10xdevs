import React, { useState } from "react";
import { Form } from "../Form";
import { Input } from "../Input";
import { Button } from "../Button";

interface UpdatePasswordFormProps {
  onSubmit: (password: string, passwordConfirmation: string) => Promise<void>;
}

export const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({ onSubmit }) => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(password, passwordConfirmation);
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
        <h3 className="text-lg font-medium text-gray-900">Password updated</h3>
        <p className="mt-2 text-sm text-gray-600">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        <Button type="button" className="mt-4" onClick={() => (window.location.href = "/auth/login")}>
          Sign in
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <Input
          label="New Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your new password"
          autoComplete="new-password"
          minLength={8}
          error={error}
        />
        <Input
          label="Confirm New Password"
          type="password"
          required
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          placeholder="Confirm your new password"
          autoComplete="new-password"
          minLength={8}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Updating password..." : "Update password"}
      </Button>
    </Form>
  );
};

export default UpdatePasswordForm;
