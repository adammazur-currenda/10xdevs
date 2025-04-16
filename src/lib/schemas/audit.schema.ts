import { z } from "zod";
import type { CreateAuditCommand } from "../../types";

export const createAuditSchema = z.object({
  audit_order_number: z
    .string()
    .min(2, "Audit order number must be at least 2 characters long")
    .max(20, "Audit order number must not exceed 20 characters"),
  protocol: z
    .string()
    .min(1000, "Protocol must be at least 1000 characters long")
    .max(10000, "Protocol must not exceed 10000 characters"),
  description: z.string().optional(),
}) satisfies z.ZodType<CreateAuditCommand>;

export type CreateAuditSchema = typeof createAuditSchema;
