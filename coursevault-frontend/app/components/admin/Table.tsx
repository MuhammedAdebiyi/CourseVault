interface TableProps {
  columns: string[];
  data: any[];
}

export default function Table({ columns, data }: TableProps) {
  return (
    <table className="min-w-full bg-[var(--background)] border text-[var(--foreground)]">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} className="px-4 py-2 border">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-700">
            {columns.map((col) => (
              <td key={col} className="px-4 py-2 border">{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
