import type { supabaseClient } from "../../db/supabase.client";
import type { CreateAuditCommand, AuditDTO } from "../../types";
import { AuditCreationError } from "../errors/audit.errors";

type SupabaseClient = typeof supabaseClient;

export class AuditService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createAudit(command: CreateAuditCommand, userId: string): Promise<AuditDTO> {
    try {
      const { data, error } = await this.supabase
        .from("audits")
        .insert({
          audit_order_number: command.audit_order_number,
          protocol: command.protocol,
          description: command.description,
          status: "pending",
          summary: "",
          user_id: userId,
        })
        .select("*")
        .single();

      if (error) {
        throw new AuditCreationError(`Database error while creating audit: ${error.message}`, error);
      }

      if (!data) {
        throw new AuditCreationError("Failed to create audit: No data returned");
      }

      return data;
    } catch (error) {
      if (error instanceof AuditCreationError) {
        throw error;
      }
      throw new AuditCreationError("Unexpected error while creating audit", error);
    }
  }
}
