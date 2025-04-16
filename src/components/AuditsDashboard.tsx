import { useCallback, useState } from "react";
import Button from "./Button";
import Table from "./Table";
import { Input } from "./Input";
import Modal from "./Modal";
import Feedback from "./Feedback";
import { useAuditsList } from "../hooks/useAuditsList";
import type { AuditListItemViewModel } from "../types";

export function AuditsDashboard() {
  const {
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
  } = useAuditsList();

  const [auditToDelete, setAuditToDelete] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
    },
    [setFilter]
  );

  const handleEdit = useCallback((auditId: string) => {
    const url = `/audits/${auditId}/edit`;
    window.location.href = url;
  }, []);

  const handleDelete = useCallback((audit: AuditListItemViewModel) => {
    setAuditToDelete({
      id: audit.id,
      orderNumber: audit.auditOrderNumber,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!auditToDelete) return;

    const success = await deleteAudit(auditToDelete.id);
    if (success) {
      setAuditToDelete(null);
    }
  }, [auditToDelete, deleteAudit]);

  const handleAddAudit = useCallback(() => {
    const url = "/audits/new";
    window.location.href = url;
  }, []);

  // Transform data for Table component
  const tableColumns = ["Numer zlecenia", "Opis", "Data utworzenia", "Status", "Akcje"];
  const tableData = audits.map((audit) => [
    audit.auditOrderNumber,
    audit.description || "-",
    audit.createdAt,
    audit.statusDisplay,
    <div key={audit.id} className="flex gap-2">
      <Button onClick={() => handleEdit(audit.id)} disabled={audit.isApproved} variant="secondary">
        Edytuj
      </Button>
      <Button onClick={() => handleDelete(audit)} disabled={audit.isApproved} variant="ghost">
        Usuń
      </Button>
    </div>,
  ]);

  if (error) {
    return (
      <Feedback variant="error" dismissible>
        <div>
          <strong>Błąd</strong>
          <p>Wystąpił błąd podczas pobierania listy audytów</p>
        </div>
      </Feedback>
    );
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <Feedback variant={feedback.variant} dismissible>
          <div>
            <p>{feedback.message}</p>
          </div>
        </Feedback>
      )}
      
      <div className="flex justify-between items-center">
        <Input
          type="text"
          placeholder="Filtruj po numerze zlecenia..."
          onChange={handleFilterChange}
          className="max-w-sm"
        />
        <Button onClick={handleAddAudit}>Dodaj Audyt</Button>
      </div>

      <Table
        columns={tableColumns}
        data={tableData}
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSort={handleSort}
        sortColumn={sortColumn ?? undefined}
        sortDirection={sortDirection ?? undefined}
        className={isLoading ? "opacity-50" : ""}
      />

      {auditToDelete && (
        <Modal isOpen={true} onClose={() => setAuditToDelete(null)}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Potwierdzenie usunięcia</h3>
            <p>Czy na pewno chcesz usunąć audyt o numerze {auditToDelete.orderNumber}?</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAuditToDelete(null)}>
                Anuluj
              </Button>
              <Button onClick={handleConfirmDelete}>Usuń</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
