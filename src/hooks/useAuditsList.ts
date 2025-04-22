import { useCallback, useEffect, useState } from "react";
import type { AuditDTO, AuditListItemViewModel, ListAuditsResponseDTO, PaginationDTO } from "../types";

type SortDirection = "asc" | "desc" | null;
type SortColumn = number | null;

interface Feedback {
  message: string;
  variant: "success" | "error";
}

export function useAuditsList() {
  const [audits, setAudits] = useState<AuditListItemViewModel[]>([]);
  const [pagination, setPagination] = useState<PaginationDTO>({ page: 1, limit: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn>(2); // Default to Created At column
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc"); // Default to descending
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const transformAudit = useCallback((audit: AuditDTO): AuditListItemViewModel => {
    const isApproved = audit.status === "approved";
    return {
      id: audit.id,
      auditOrderNumber: audit.audit_order_number,
      description: audit.description,
      createdAt: new Date(audit.created_at).toLocaleString("pl-PL"),
      statusDisplay: isApproved ? "Zatwierdzony" : "Nowy",
      statusVariant: isApproved ? "secondary" : "default",
      isApproved,
    };
  }, []);

  const getSortParam = useCallback(() => {
    if (sortColumn === 2) return sortDirection === "desc" ? "-created_at" : "created_at";
    if (sortColumn === 0) return sortDirection === "desc" ? "-audit_order_number" : "audit_order_number";
    return "-created_at"; // Default sort
  }, [sortColumn, sortDirection]);

  const fetchAudits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: getSortParam(),
      });

      if (filter) {
        params.append("filter", filter);
      }

      const response = await fetch(`/api/audits?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch audits");
      }

      const data: ListAuditsResponseDTO = await response.json();
      setAudits(data.audits.map(transformAudit));
      setPagination(data.pagination);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filter, getSortParam, transformAudit]);

  // Refresh list when sort parameters change
  useEffect(() => {
    fetchAudits();
  }, [sortColumn, sortDirection, fetchAudits]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((prev) => ({ ...prev, page: 1, limit }));
  }, []);

  const deleteAudit = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/audits/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          setFeedback({
            message: error.error || "Failed to delete audit",
            variant: "error",
          });
          return false;
        }

        await fetchAudits();
        setFeedback({
          message: "Audit deleted successfully",
          variant: "success",
        });
        return true;
      } catch (error) {
        console.error(error);
        setFeedback({
          message: "Failed to delete audit",
          variant: "error",
        });
        return false;
      }
    },
    [fetchAudits]
  );

  const handleSort = useCallback((columnIndex: number) => {
    setSortColumn((prevColumn) => {
      if (prevColumn === columnIndex) {
        setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
        return columnIndex;
      }
      setSortDirection("asc");
      return columnIndex;
    });
  }, []);

  return {
    audits,
    pagination,
    isLoading,
    error,
    setPage,
    setLimit,
    setFilter,
    deleteAudit,
    sortColumn,
    sortDirection,
    handleSort,
    feedback,
  };
}
