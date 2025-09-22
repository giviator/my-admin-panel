import React from 'react';

const Table: React.FC<{ data: any[]; className?: string }> = ({ data, className = '' }) => {
  return (
    <table className={`w-full border-collapse border ${className}`}>
      <thead>
        <tr>
          <th className="border p-2">ID</th>
          <th className="border p-2">Name</th>
          <th className="border p-2">Email</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            <td className="border p-2">{row.id}</td>
            <td className="border p-2">{row.name}</td>
            <td className="border p-2">{row.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;