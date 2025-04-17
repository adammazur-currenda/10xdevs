import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Textarea from "@/components/Textarea";
import { Feedback } from "@/components/Feedback";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { CreateAuditCommand, AuditDTO } from "@/types";

interface CreateAuditFormViewModel {
  id: string | null;
  audit_order_number: string;
  description: string;
  protocol: string;
  status: "new";
  isSaving: boolean;
  errors: {
    audit_order_number?: string;
    protocol?: string;
    submit?: string;
    [key: string]: string | undefined;
  };
  feedback?: {
    type: "success" | "error";
    message: string;
  };
}

const initialFormState: CreateAuditFormViewModel = {
  id: null,
  audit_order_number: "",
  description: "",
  protocol: "",
  status: "new",
  isSaving: false,
  errors: {},
};

export function CreateAuditForm() {
  const [formState, setFormState] = useState<CreateAuditFormViewModel>(initialFormState);

  const handleInputChange = (field: keyof CreateAuditFormViewModel, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined, // Clear error when field is modified
      },
    }));
  };

  const validateForm = (): boolean => {
    const errors: CreateAuditFormViewModel["errors"] = {};

    if (
      !formState.audit_order_number ||
      formState.audit_order_number.length < 2 ||
      formState.audit_order_number.length > 20
    ) {
      errors.audit_order_number = "Order number must be between 2 and 20 characters";
    }

    if (!formState.protocol || formState.protocol.length < 1000 || formState.protocol.length > 10000) {
      errors.protocol = "Protocol must be between 1000 and 10000 characters";
    }

    setFormState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, isSaving: true, feedback: undefined }));
    try {
      const response = await fetch("/api/audits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audit_order_number: formState.audit_order_number,
          protocol: formState.protocol,
          description: formState.description || undefined,
        } as CreateAuditCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save audit");
      }

      const data = (await response.json()) as AuditDTO;
      setFormState((prev) => ({
        ...prev,
        id: data.id,
        isSaving: false,
        feedback: {
          type: "success",
          message: "Audit saved successfully",
        },
      }));

      // Redirect to edit page after successful save
      window.location.href = `/audits/edit/${data.id}`;
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        isSaving: false,
        feedback: {
          type: "error",
          message: error instanceof Error ? error.message : "Failed to save audit. Please try again.",
        },
      }));
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e: React.FormEvent) => e.preventDefault()}>
      {formState.feedback && (
        <Feedback
          variant={formState.feedback.type === "success" ? "success" : "error"}
          dismissible
          onClose={() => setFormState((prev) => ({ ...prev, feedback: undefined }))}
          className="mb-4"
        >
          {formState.feedback.message}
        </Feedback>
      )}

      <div className="space-y-4">
        <div>
          <Input
            id="audit_order_number"
            label="Audit Order Number *"
            value={formState.audit_order_number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleInputChange("audit_order_number", e.target.value)
            }
            error={formState.errors.audit_order_number}
            aria-invalid={!!formState.errors.audit_order_number}
            aria-describedby={formState.errors.audit_order_number ? "audit_order_number-error" : undefined}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <Textarea
            id="description"
            value={formState.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="protocol" className="block text-sm font-medium mb-1">
            Protocol *
          </label>
          <Textarea
            id="protocol"
            value={formState.protocol}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("protocol", e.target.value)}
            error={!!formState.errors.protocol}
            aria-invalid={!!formState.errors.protocol}
            aria-describedby={formState.errors.protocol ? "protocol-error" : undefined}
            className="min-h-[200px]"
          />
          {formState.errors.protocol && (
            <p id="protocol-error" className="text-sm text-red-500 mt-1">
              {formState.errors.protocol}
            </p>
          )}
          <p className="mt-2 text-sm text-gray-500">{formState.protocol.length} / 10000 characters</p>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        {formState.errors.submit && <p className="text-sm text-red-500 mr-auto">{formState.errors.submit}</p>}
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={formState.isSaving}
          className={formState.isSaving ? "opacity-70 cursor-wait" : ""}
        >
          {formState.isSaving ? (
            <span className="flex items-center">
              <LoadingSpinner />
              Saving...
            </span>
          ) : (
            "Save Audit"
          )}
        </Button>
      </div>
    </form>
  );
}
