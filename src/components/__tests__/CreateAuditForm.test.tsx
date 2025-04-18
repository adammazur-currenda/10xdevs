import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import type { CreateAuditCommand, AuditDTO } from "@/types";

// Base URL for API calls
const API_BASE_URL = "http://localhost:3000";

// Mock window.location
const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

interface FormState {
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

// Extract business logic to test
const useCreateAuditForm = () => {
  const [formState, setFormState] = useState<FormState>({
    id: null,
    audit_order_number: "",
    description: "",
    protocol: "",
    status: "new",
    isSaving: false,
    errors: {},
  });

  const validateForm = () => {
    const errors: FormState["errors"] = {};

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
      const response = await fetch(`${API_BASE_URL}/api/audits`, {
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

  const handleInputChange = (field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }));
  };

  return {
    formState,
    handleInputChange,
    validateForm,
    handleSave,
  };
};

describe("CreateAuditForm Business Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Form Validation", () => {
    it("should validate audit order number length", async () => {
      const { result } = renderHook(() => useCreateAuditForm());

      // Test valid order number first
      await act(async () => {
        result.current.handleInputChange("audit_order_number", "ABC123");
      });

      await act(async () => {
        result.current.validateForm();
      });

      expect(result.current.formState.errors.audit_order_number).toBeUndefined();

      // Test too short order number
      await act(async () => {
        result.current.handleInputChange("audit_order_number", "a");
      });

      await act(async () => {
        result.current.validateForm();
      });

      expect(result.current.formState.errors.audit_order_number).toBeDefined();
    });

    it("should validate protocol length", async () => {
      const { result } = renderHook(() => useCreateAuditForm());

      // Test valid protocol first
      await act(async () => {
        result.current.handleInputChange("protocol", "a".repeat(1000));
      });

      await act(async () => {
        result.current.validateForm();
      });

      expect(result.current.formState.errors.protocol).toBeUndefined();

      // Test too short protocol
      await act(async () => {
        result.current.handleInputChange("protocol", "Short protocol");
      });

      await act(async () => {
        result.current.validateForm();
      });

      expect(result.current.formState.errors.protocol).toBeDefined();
    });
  });

  describe("Form Submission", () => {
    it("should handle successful form submission", async () => {
      const mockAuditData: Partial<AuditDTO> = {
        id: "123",
        audit_order_number: "TEST123",
        protocol: "a".repeat(1000),
        description: "Test description",
        status: "new",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        summary: null,
        user_id: "user123",
      };

      const expectedRequestBody = {
        audit_order_number: "TEST123",
        protocol: "a".repeat(1000),
        description: "Test description",
      };

      const mockFetch = vi.fn().mockImplementation(async (url, options) => {
        // Verify the request
        expect(url).toBe(`${API_BASE_URL}/api/audits`);
        expect(JSON.parse(options.body)).toEqual(expectedRequestBody);

        return new Response(JSON.stringify(mockAuditData), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      });

      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useCreateAuditForm());

      // Set form values
      await act(async () => {
        result.current.handleInputChange("audit_order_number", "TEST123");
      });

      await act(async () => {
        result.current.handleInputChange("protocol", "a".repeat(1000));
      });

      await act(async () => {
        result.current.handleInputChange("description", "Test description");
      });

      // Validate form before submission
      let isValid = false;
      await act(async () => {
        isValid = result.current.validateForm();
      });
      expect(isValid).toBe(true);
      expect(result.current.formState.errors).toEqual({});

      // Submit form
      await act(async () => {
        await result.current.handleSave();
      });

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verify form state after submission
      expect(result.current.formState.feedback?.type).toBe("success");
      expect(result.current.formState.id).toBe("123");
      expect(mockLocation.href).toBe("/audits/edit/123");
    });

    it("should handle failed form submission", async () => {
      const errorMessage = "Server error";

      const mockFetch = vi.fn().mockImplementation(async () => {
        return new Response(JSON.stringify({ message: errorMessage }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      });

      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useCreateAuditForm());

      // Set valid form data
      await act(async () => {
        result.current.handleInputChange("audit_order_number", "TEST123");
      });

      await act(async () => {
        result.current.handleInputChange("protocol", "a".repeat(1000));
      });

      // Validate form before submission
      let isValid = false;
      await act(async () => {
        isValid = result.current.validateForm();
      });
      expect(isValid).toBe(true);
      expect(result.current.formState.errors).toEqual({});

      // Submit form
      await act(async () => {
        await result.current.handleSave();
      });

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verify error state
      expect(result.current.formState.feedback?.type).toBe("error");
      expect(result.current.formState.feedback?.message).toBe(errorMessage);
      expect(mockLocation.href).toBe("");
    });

    it("should not call fetch when form is invalid", async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useCreateAuditForm());

      await act(async () => {
        result.current.handleInputChange("audit_order_number", "a"); // too short
      });

      await act(async () => {
        result.current.handleInputChange("protocol", "too short"); // too short
      });

      // Validate form before submission
      let isValid = false;
      await act(async () => {
        isValid = result.current.validateForm();
      });
      expect(isValid).toBe(false);
      expect(result.current.formState.errors.audit_order_number).toBeDefined();
      expect(result.current.formState.errors.protocol).toBeDefined();

      // Try to submit invalid form
      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("Form State Management", () => {
    it("should clear field errors on input change", async () => {
      const { result } = renderHook(() => useCreateAuditForm());

      // First trigger an error
      await act(async () => {
        result.current.handleInputChange("audit_order_number", "a");
        result.current.validateForm();
      });

      expect(result.current.formState.errors.audit_order_number).toBeDefined();

      // Then update the field
      await act(async () => {
        result.current.handleInputChange("audit_order_number", "valid_number");
      });

      expect(result.current.formState.errors.audit_order_number).toBeUndefined();
    });

    it("should not submit form with validation errors", async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useCreateAuditForm());

      await act(async () => {
        result.current.handleInputChange("audit_order_number", "a"); // too short
        result.current.handleInputChange("protocol", "too short"); // too short
        await result.current.handleSave();
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.formState.errors.audit_order_number).toBeDefined();
      expect(result.current.formState.errors.protocol).toBeDefined();
    });
  });
});
