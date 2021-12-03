import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getStore } from './store';

type Params = {
  title: string;
  role: SubjectRole;
};

const List = ({ title, role }: Params) => {
  const [messageIds, setMessageIds] = useState<Array<[string, string]>>([]);

  useEffect(() => {
    (async function () {
      const entries = await getStore(role).entries();
      setMessageIds(entries);
    })();
  }, [role]);
  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {title}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {messageIds.map(([messageId, name]) => (
            <tr key={messageId} className="text-sm">
              <td className="p-2 whitespace-nowrap hover:bg-gray-200">
                <Link to={`/m/${messageId}`}>
                  <div className="text-sm text-gray-900">{name}</div>
                  <div className="text-sm text-gray-500">{messageId}</div>
                </Link>
              </td>
            </tr>
          ))}
          {messageIds.length === 0 && (
            <tr>
              <td className="text-sm p-2">No exchanges</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default List;
