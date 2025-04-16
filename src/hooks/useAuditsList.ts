import { useState, useCallback, useEffect } from "react";
import type { AuditDTO, ListAuditsResponseDTO, PaginationDTO, AuditListItemViewModel } from "../types";

interface UseAuditsListParams {
  initialPage?: number;
  initialLimit?: number;
}

interface UseAuditsListState {
  audits: AuditListItemViewModel[];
  pagination: PaginationDTO;
  isLoading: boolean;
  error: Error | null;
  sortColumn: number | null;
  sortDirection: "asc" | "desc" | null;
  feedback: { variant: "error" | "success"; message: string } | null;
}

const SORTABLE_COLUMNS = ["audit_order_number", "created_at", "status"];

export function useAuditsList({ initialPage = 1, initialLimit = 10 }: UseAuditsListParams = {}) {
  const [state, setState] = useState<UseAuditsListState>({
    audits: [],
    pagination: {
      page: initialPage,
      limit: initialLimit,
      total: 0,
    },
    isLoading: true,
    error: null,
    sortColumn: 1,
    sortDirection: "desc",
    feedback: null,
  });
  const [filter, setFilterValue] = useState("");

  // Transform AuditDTO to AuditListItemViewModel
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

  // Fetch audits from API
  const fetchAudits = useCallback(
    async (params: { page?: number; limit?: number; sort?: string }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const searchParams = new URLSearchParams({
          page: params.page?.toString() || state.pagination.page.toString(),
          limit: params.limit?.toString() || state.pagination.limit.toString(),
        });

        if (params.sort) {
          searchParams.append("sort", params.sort);
        }

        const response = await fetch(`/api/audits?${searchParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audits");
        }

        const data: ListAuditsResponseDTO = await response.json();
        const transformedAudits = data.audits.map(transformAudit);

        setState((prev) => ({
          ...prev,
          audits: transformedAudits,
          pagination: data.pagination,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
          feedback: {
            variant: "error",
            message: "Wystąpił błąd podczas pobierania listy audytów",
          },
        }));
      }
    },
    [state.pagination.page, state.pagination.limit, transformAudit]
  );

  // Handle sorting
  const handleSort = useCallback(
    (columnIndex: number) => {
      const column = SORTABLE_COLUMNS[columnIndex];
      if (!column) return;

      setState((prev) => {
        const newDirection: "asc" | "desc" | null =
          prev.sortColumn === columnIndex
            ? prev.sortDirection === "asc"
              ? "desc"
              : prev.sortDirection === "desc"
                ? null
                : "asc"
            : "asc";

        const newState = {
          ...prev,
          sortColumn: newDirection ? columnIndex : null,
          sortDirection: newDirection,
        };

        // Trigger fetch with new sort
        const sortParam = newDirection ? `${newDirection === "desc" ? "-" : ""}${column}` : undefined;
        fetchAudits({ sort: sortParam });

        return newState;
      });
    },
    [fetchAudits]
  );

  // Delete audit
  const deleteAudit = useCallback(
    async (auditId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/audits/${auditId}`, {
          method: "DELETE",
        });

        if (response.status === 403) {
          setState((prev) => ({
            ...prev,
            feedback: {
              variant: "error",
              message: "Nie można usunąć zatwierdzonego audytu",
            },
          }));
          return false;
        }

        if (response.status === 404) {
          setState((prev) => ({
            ...prev,
            feedback: {
              variant: "error",
              message: "Audyt nie został znaleziony",
            },
          }));
          return false;
        }

        if (!response.ok) {
          throw new Error("Failed to delete audit");
        }

        setState((prev) => ({
          ...prev,
          feedback: {
            variant: "success",
            message: "Audyt został usunięty",
          },
        }));

        // Refresh the list
        await fetchAudits({});
        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          feedback: {
            variant: "error",
            message: "Wystąpił błąd podczas usuwania audytu",
          },
        }));
        return false;
      }
    },
    [fetchAudits]
  );

  // Filter audits client-side
  const filteredAudits = useCallback(() => {
    if (!filter) return state.audits;
    return state.audits.filter((audit) => audit.auditOrderNumber.toLowerCase().includes(filter.toLowerCase()));
  }, [state.audits, filter]);

  // Pagination handlers
  const setPage = useCallback(
    (page: number) => {
      fetchAudits({ page });
    },
    [fetchAudits]
  );

  const setLimit = useCallback(
    (limit: number) => {
      fetchAudits({ page: 1, limit });
    },
    [fetchAudits]
  );

  // Debounced filter setter
  const setFilter = useCallback((value: string) => {
    setFilterValue(value);
  }, []);

  // Initial fetch with default sorting
  useEffect(() => {
    fetchAudits({
      page: initialPage,
      limit: initialLimit,
      sort: "-created_at",
    });
  }, [fetchAudits, initialPage, initialLimit]);

  return {
    audits: filteredAudits(),
    pagination: state.pagination,
    isLoading: state.isLoading,
    error: state.error,
    sortColumn: state.sortColumn,
    sortDirection: state.sortDirection,
    setPage,
    setLimit,
    setFilter,
    deleteAudit,
    handleSort,
    feedback: state.feedback,
  };
}
