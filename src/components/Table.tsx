import React from "react";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  columns: string[];
  data: (string | number | React.ReactNode)[][];
  onSort?: (columnIndex: number) => void;
}

const Table: React.FC<TableProps> = ({ columns, data, onSort, ...rest }) => {
  const handleSort = (columnIndex: number) => {
    if (onSort) {
      onSort(columnIndex);
    }
  };

  return (
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
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-100">
              {row.map((cell, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
