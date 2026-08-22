import type * as React from 'react';

type GuideTableRow = {
  /** Stable key used when rendering the row. */
  key: string;
  /** Cells ordered to match the table columns. */
  cells: readonly React.ReactNode[];
};

type GuideTableProps = {
  /** Column headings displayed across the table header. */
  columns: readonly string[];
  /** Body rows displayed in column order. */
  rows: readonly GuideTableRow[];
};

/**
 * Renders a responsive comparison table shared by guide pages.
 * @param columns Column headings.
 * @param rows Table rows with stable keys and ordered cells.
 * @returns Responsive guide table.
 */
export function GuideTable({ columns, rows }: GuideTableProps) {
  return (
    <div className='overflow-x-auto rounded-md border'>
      <table className='w-full min-w-2xl border-collapse text-left text-sm'>
        <thead>
          <tr className='border-b bg-primary/5'>
            {columns.map((column) => (
              <th
                key={column}
                className='px-4 py-3 font-semibold tracking-wide'
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className='border-b last:border-b-0'>
              {row.cells.map((cell, index) => (
                <td key={`${row.key}-${columns[index]}`} className='px-4 py-3'>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
