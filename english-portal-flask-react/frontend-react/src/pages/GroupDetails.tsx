import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { groups } from '../lib/api';
import type { StudySession } from '../types/api';

export function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const groupId = parseInt(id!, 10);

  const { data: group, isLoading: isLoadingGroup, error: groupError } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groups.getById(groupId)
  });

  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['group-sessions', groupId],
    queryFn: () => groups.getSessions(groupId)
  });

  if (isLoadingGroup || isLoadingSessions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (groupError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading group details. Please try again later.</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Group not found.</p>
      </div>
    );
  }

  const sessions = sessionsData?.items || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{group.name}</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800">Total Words</div>
            <div className="mt-1 text-2xl font-semibold text-blue-600">
              {group.word_count}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-800">Total Sessions</div>
            <div className="mt-1 text-2xl font-semibold text-purple-600">
              {group.total_sessions}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-800">Success Rate</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">
              {group.success_rate}%
            </div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="text-sm font-medium text-indigo-800">Last Studied</div>
            <div className="mt-1 text-sm font-medium text-indigo-600">
              {group.last_studied_at ? new Date(group.last_studied_at).toLocaleDateString() : 'Never'}
            </div>
          </div>
        </div>

        {/* Words Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Words</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.words?.map((word) => (
                <div key={word.id} className="bg-white p-4 rounded-md shadow-sm">
                  <div className="font-medium text-gray-900">{word.english}</div>
                  <div className="text-gray-500">{word.spanish}</div>
                  <div className="mt-2 text-sm">
                    <span className="text-green-600">{word.correct_count} correct</span>
                    <span className="mx-2">•</span>
                    <span className="text-red-600">{word.wrong_count} wrong</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sessions Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Study Sessions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items Reviewed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sessions.map((session: StudySession) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.activity_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(session.start_time).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {session.review_items_count} items
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 