
import React, { useState, useMemo } from 'react';
import { AuditLogEntry } from '../../types';
import Card from './Card';

interface AuditLogProps {
  logEntries: AuditLogEntry[];
}

const AuditLog: React.FC<AuditLogProps> = ({ logEntries }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logEntries
      .filter(log => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          log.actorName.toLowerCase().includes(lowerSearchTerm) ||
          log.actionType.toLowerCase().includes(lowerSearchTerm) ||
          log.details.toLowerCase().includes(lowerSearchTerm)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logEntries, searchTerm]);

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search logs by user, action, or details..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500"
        />
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLogs.length > 0 ? (
              filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.actorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.actionType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-500">No matching log entries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AuditLog;
