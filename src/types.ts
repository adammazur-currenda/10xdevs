import type { Database } from "./db/database.types";

/**
 * DTO representing a complete audit record from the database.
 * Directly derived from the 'audits' table in the database model.
 */
export type AuditDTO = Database["public"]["Tables"]["audits"]["Row"];

/**
 * DTO for pagination details used in list endpoints.
 */
export interface PaginationDTO {
  page: number;
  limit: number;
  total: number;
}

/**
 * DTO for the response of listing audits.
 */
export interface ListAuditsResponseDTO {
  audits: AuditDTO[];
  pagination: PaginationDTO;
}

/**
 * DTO for getting details of a single audit. It is identical to AuditDTO.
 */
export type GetAuditResponseDTO = AuditDTO;

/**
 * Command Model for creating a new audit (POST /audits).
 * Includes fields from the request payload as defined in the API plan:
 * - audit_order_number: string (2-20 chars)
 * - protocol: string (1000-10000 chars)
 * - description: optional string
 */
export interface CreateAuditCommand {
  audit_order_number: string;
  protocol: string;
  description?: string;
}

/**
 * Command Model for updating an existing audit (PATCH /audits/{id}).
 * Permits updating of the following fields only:
 * - protocol
 * - description
 * - summary
 * The audit_order_number remains immutable.
 */
export type UpdateAuditCommand = Partial<Pick<AuditDTO, "protocol" | "description" | "summary">>;

/**
 * DTO for the request to generate an AI summary (POST /audits/generate-summary).
 * Accepts the protocol text from which a summary will be generated.
 */
export interface GenerateSummaryRequestDTO {
  protocol: string;
}

/**
 * DTO for the response of generating an AI summary.
 * Contains the summary with bullet points.
 */
export interface GenerateSummaryResponseDTO {
  summary: string;
}

/**
 * Command Model for approving an audit (POST /audits/{id}/approve).
 * Optionally accepts a confirmation flag.
 */
export interface ApproveAuditCommand {
  confirm?: boolean;
}

/**
 * Command Model for deleting an audit (DELETE /audits/{id}).
 * No payload is required for this action.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeleteAuditCommand {}

/**
 * ViewModel for displaying audit items in the list view.
 * Transforms AuditDTO into a format optimized for UI display.
 */
export interface AuditListItemViewModel {
  id: string;
  auditOrderNumber: string;
  description: string | null;
  createdAt: string;
  statusDisplay: string;
  statusVariant: "default" | "secondary" | "destructive" | "outline";
  isApproved: boolean;
}
