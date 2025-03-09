import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { studyActivities } from '../lib/api';
import { format } from 'date-fns';

export function StudyActivityDetails() {
  const { id } = useParams<{ id: string }>();
  const activityId = parseInt(id || '0');

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => studyActivities.getById(activityId),
    enabled: !!activityId,
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['activity-sessions', activityId],
    queryFn: () => studyActivities.getSessions(activityId),
    enabled: !!activityId,
  });

  if (activityLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Activity not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activity.name}</h1>
            <p className="mt-2 text-gray-600">{activity.description}</p>
            <button
              onClick={() => window.open(`http://localhost:8081?activityId=${activity.id}`, '_blank')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Launch Activity
            </button>
          </div>
        </div>
      </div>

      {/* Sessions History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Sessions History</h2>
        {sessionsData?.items.length === 0 ? (
          <p className="text-gray-500">No study sessions found for this activity.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
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
                {sessionsData?.items.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.group_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(session.start_time), 'PPp')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.review_items_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 