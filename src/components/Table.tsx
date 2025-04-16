import React from "react";
import type { PaginationDTO } from "../types";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  columns: string[];
  data: (string | number | React.ReactNode)[][];
  onSort?: (columnIndex: number) => void;
  pagination?: PaginationDTO;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  sortColumn?: number;
  sortDirection?: "asc" | "desc";
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  onSort,
  pagination,
  onPageChange,
  onLimitChange,
  sortColumn,
  sortDirection,
  ...rest
}) => {
  const handleSort = (columnIndex: number) => {
    if (onSort) {
      onSort(columnIndex);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange && pagination) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onLimitChange) {
      onLimitChange(Number(event.target.value));
    }
  };

  const renderSortIcon = (columnIndex: number) => {
    if (!onSort || columnIndex !== sortColumn) return null;

    return (
      <span className="ml-1 inline-block">{sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : ""}</span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table {...rest} className={`min-w-full divide-y divide-gray-200 ${rest.className || ""}`}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(index)}
                  className={
                    onSort
                      ? "cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-blue-500"
                      : "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  }
                >
                  <span className="flex items-center">
                    {col}
                    {renderSortIcon(index)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-100">
                  {row.map((cell, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  Brak danych do wyświetlenia
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Wyników na stronie:</span>
            <select
              value={pagination.limit}
              onChange={handleLimitChange}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Poprzednia
            </button>
            <span className="text-sm text-gray-700">
              Strona {pagination.page} z {Math.ceil(pagination.total / pagination.limit)}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Następna
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
