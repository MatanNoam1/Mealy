import './DataTable.css';

// Reusable data table (spec component #7). Renders a real <table> and
// dynamically maps over an array of backend data to generate rows.
//
// Props:
//   columns: [{ label, field, render? }]  - render(row) overrides field lookup
//   rows:    array of objects
//   rowKey:  field used as the React key (default 'id')
//   emptyMessage: text shown when rows is empty
function DataTable({ columns, rows, rowKey = 'id', emptyMessage = 'No data.' }) {
  return (
    <div className="datatable__wrap">
      <table className="datatable">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="datatable__empty" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row[rowKey] ?? index}>
                {columns.map((col) => (
                  <td key={col.label}>
                    {col.render ? col.render(row) : row[col.field]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
