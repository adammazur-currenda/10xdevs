import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Textarea from "@/components/Textarea";
import { Feedback } from "@/components/Feedback";
import { Modal } from "@/components/Modal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { AuditDTO } from "@/types";

// Form validation schema
const formSchema = z.object({
  description: z.string().optional(),
  protocol: z
    .string()
    .min(1000, "Protocol must be between 1000 and 10000 characters")
    .max(10000, "Protocol must be between 1000 and 10000 characters"),
  summary: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditAuditFormProps {
  initialData: AuditDTO;
}

export default function EditAuditForm({ initialData }: EditAuditFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    formState: { errors },
    setValue,
    watch,
    getValues,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData.description || "",
      protocol: initialData.protocol || "",
      summary: initialData.summary || "",
    },
    mode: "onChange",
  });

  // Force update form values when initialData changes
  useEffect(() => {
    setValue("description", initialData.description || "");
    setValue("protocol", initialData.protocol || "");
    setValue("summary", initialData.summary || "");
  }, [initialData, setValue]);

  const isApproved = initialData.status === "approved";
  const protocol = watch("protocol");

  const onGenerateSummary = async () => {
    try {
      setIsGenerating(true);
      setFeedback(null);

      const response = await fetch(`/api/audits/generate-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocol }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setValue("summary", data.summary);
      setFeedback({
        type: "success",
        message: "Summary generated successfully",
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to generate summary",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      // Trigger validation manually
      const isFormValid = await trigger();
      if (!isFormValid) {
        const errorMessages = [];
        if (errors.protocol) {
          errorMessages.push(errors.protocol.message);
        }
        if (errors.description) {
          errorMessages.push(errors.description.message);
        }
        if (errors.summary) {
          errorMessages.push(errors.summary.message);
        }

        setFeedback({
          type: "error",
          message: errorMessages.join(". ") || "Please fix validation errors before saving",
        });
        return;
      }

      setIsSaving(true);
      setFeedback(null);

      const formData = getValues();
      const response = await fetch(`/api/audits/${initialData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: formData.description,
          protocol: formData.protocol,
          summary: formData.summary,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save changes");
      }

      await response.json();
      setFeedback({
        type: "success",
        message: "Changes saved successfully",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save changes",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveClick = () => {
    setShowApproveConfirm(true);
  };

  const handleApproveConfirm = async () => {
    setShowApproveConfirm(false);
    await onApprove();
  };

  const onApprove = async () => {
    try {
      setIsApproving(true);
      setFeedback(null);

      const response = await fetch(`/api/audits/${initialData.id}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to approve audit");
      }

      await response.json();
      setFeedback({
        type: "success",
        message: "Audit approved successfully",
      });
    } catch (error) {
      console.error("Error approving audit:", error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to approve audit",
      });
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form className="space-y-6">
        {feedback && (
          <Feedback
            variant={feedback.type === "success" ? "success" : "error"}
            dismissible
            onClose={() => setFeedback(null)}
            className="mb-6"
          >
            {feedback.message}
          </Feedback>
        )}

        <div className="space-y-6">
          <div>
            <Input
              label="Audit Order Number"
              value={initialData.audit_order_number}
              disabled
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <Textarea
              id="description"
              {...register("description")}
              value={watch("description")}
              onChange={(e) => setValue("description", e.target.value)}
              disabled={isApproved}
              className="min-h-[100px]"
            />
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div>
            <label htmlFor="protocol" className="block text-sm font-medium text-gray-700 mb-2">
              Protocol *
            </label>
            <Textarea
              id="protocol"
              {...register("protocol")}
              value={watch("protocol")}
              onChange={(e) => setValue("protocol", e.target.value)}
              disabled={isApproved}
              error={!!errors.protocol}
              className="min-h-[200px]"
            />
            {errors.protocol && <p className="mt-2 text-sm text-red-600">{errors.protocol.message}</p>}
            <p className="mt-2 text-sm text-gray-500">{watch("protocol").length} / 10000 characters</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                Summary
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={onGenerateSummary}
                disabled={
                  isApproved || isGenerating || watch("protocol").length < 1000 || watch("protocol").length > 10000
                }
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <LoadingSpinner />
                    Generating...
                  </span>
                ) : (
                  "Generate Summary"
                )}
              </Button>
            </div>
            <Textarea
              id="summary"
              {...register("summary")}
              value={watch("summary")}
              onChange={(e) => setValue("summary", e.target.value)}
              disabled={isApproved}
              className="min-h-[150px]"
            />
            {errors.summary && <p className="mt-2 text-sm text-red-600">{errors.summary.message}</p>}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <Button type="button" variant="primary" onClick={handleSave} disabled={isApproved || isSaving}>
            {isSaving ? (
              <span className="flex items-center">
                <LoadingSpinner />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
          {!isApproved && (
            <Button type="button" variant="secondary" onClick={handleApproveClick} disabled={isApproving}>
              {isApproving ? (
                <span className="flex items-center">
                  <LoadingSpinner />
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
    </div>
  );
}
