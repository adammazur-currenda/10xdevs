import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Textarea from "@/components/Textarea";
import { Feedback } from "@/components/Feedback";
import { Modal } from "@/components/Modal";
import type {
  CreateAuditCommand,
  GenerateSummaryRequestDTO,
  GenerateSummaryResponseDTO,
  AuditDTO,
  ApproveAuditCommand,
} from "@/types";

interface CreateAuditFormViewModel {
  id: string | null;
  audit_order_number: string;
  description: string;
  protocol: string;
  summary: string;
  status: "pending" | "approved" | "new";
  isLoadingSummary: boolean;
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
  summary: "",
  status: "new",
  isLoadingSummary: false,
  isSaving: false,
  errors: {},
};

export function CreateAuditForm() {
  const [formState, setFormState] = useState<CreateAuditFormViewModel>(initialFormState);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

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

  const handleGenerateSummary = async () => {
    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, isLoadingSummary: true }));
    try {
      const response = await fetch("/api/audits/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocol: formState.protocol } as GenerateSummaryRequestDTO),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      const data = (await response.json()) as GenerateSummaryResponseDTO;
      setFormState((prev) => ({
        ...prev,
        summary: data.summary,
        isLoadingSummary: false,
      }));
    } catch (error: unknown) {
      console.error("Failed to generate summary:", error);
      setFormState((prev) => ({
        ...prev,
        isLoadingSummary: false,
        errors: { ...prev.errors, summary: "Failed to generate summary. Please try again." },
      }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, isSaving: true, feedback: undefined }));
    try {
      const response = await fetch("/api/audits.new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        status: "pending",
        isSaving: false,
        feedback: {
          type: "success",
          message: "Audit saved successfully",
        },
      }));
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

  const handleApproveClick = () => {
    setShowApproveConfirm(true);
  };

  const handleApproveConfirm = async () => {
    setShowApproveConfirm(false);
    await handleApprove();
  };

  const handleApprove = async () => {
    if (!formState.id) return;

    setFormState((prev) => ({ ...prev, isSaving: true, feedback: undefined }));
    try {
      const response = await fetch(`/api/audits/${formState.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true } as ApproveAuditCommand),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve audit");
      }

      await response.json();
      setFormState((prev) => ({
        ...prev,
        status: "approved",
        isSaving: false,
        feedback: {
          type: "success",
          message: "Audit approved successfully",
        },
      }));
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        isSaving: false,
        feedback: {
          type: "error",
          message: error instanceof Error ? error.message : "Failed to approve audit. Please try again.",
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
            disabled={formState.status === "approved"}
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
            disabled={formState.status === "approved"}
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
            disabled={formState.status === "approved"}
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
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="summary" className="block text-sm font-medium">
              Summary
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerateSummary}
              disabled={
                formState.status === "approved" ||
                formState.isLoadingSummary ||
                formState.protocol.length < 1000 ||
                formState.protocol.length > 10000
              }
            >
              {formState.isLoadingSummary ? "Generating..." : "Generate Summary"}
            </Button>
          </div>
          <Textarea
            id="summary"
            value={formState.summary}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("summary", e.target.value)}
            disabled={formState.status === "approved" || !formState.summary}
            className="min-h-[150px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        {formState.errors.submit && <p className="text-sm text-red-500 mr-auto">{formState.errors.submit}</p>}
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={formState.status === "approved" || formState.isSaving}
          className={formState.isSaving && formState.status === "new" ? "opacity-70 cursor-wait" : ""}
        >
          {formState.isSaving && formState.status === "new" ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save Audit"
          )}
        </Button>
        {formState.id && formState.status === "pending" && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleApproveClick}
            disabled={formState.isSaving}
            className={formState.isSaving ? "opacity-70 cursor-wait" : ""}
          >
            {formState.isSaving ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Approving...
              </span>
            ) : (
              "Approve Audit"
            )}
          </Button>
        )}
      </div>

      <Modal isOpen={showApproveConfirm} onClose={() => setShowApproveConfirm(false)} className="max-w-md">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Confirm Approval</h2>
          <p>Are you sure you want to approve this audit? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowApproveConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApproveConfirm}>
              Approve
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  );
}
