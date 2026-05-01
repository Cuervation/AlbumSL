import type { ReactNode } from "react";

export interface AdminTableColumn<Row> {
  readonly key: string;
  readonly label: string;
  readonly render: (row: Row) => ReactNode;
}

export function AdminTable<Row>({
  columns,
  emptyMessage,
  rows,
}: {
  readonly columns: readonly AdminTableColumn<Row>[];
  readonly emptyMessage: string;
  readonly rows: readonly Row[];
}): React.JSX.Element {
  if (rows.length === 0) {
    return <p className="state-message compact">{emptyMessage}</p>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
