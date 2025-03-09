import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessions } from '../lib/api';
import type { SessionFilter } from '../types/api';
import { useLanguage } from '../contexts/LanguageContext';

export function Sessions() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<SessionFilter>({
    sort_by: 'start_time',
    sort_order: 'desc'
  });

  const { data: sessionsData, isLoading, error } = useQuery({
    queryKey: ['sessions', filters],
    queryFn: () => sessions.getAll(filters)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{t('common.error')}</p>
      </div>
    );
  }

  const items = sessionsData?.items || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{t('sessions.title')}</h1>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.activity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.group')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.date')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.duration')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.itemsReviewed')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sessions.successRate')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((session) => {
                const startTime = new Date(session.start_time);
                const endTime = new Date(session.end_time);
                const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // in minutes

                return (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {session.activity_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {session.group_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {startTime.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {startTime.toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {duration} {t('sessions.minutes')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {session.review_items_count} {t('sessions.items')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${session.success_rate >= 80 ? 'bg-green-100 text-green-800' :
                          session.success_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {session.success_rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('sessions.noSessions')}</p>
          </div>
        )}
      </div>
    </div>
  );
} 