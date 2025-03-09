import { Link } from 'react-router-dom';
import type { Group } from '../../types/api';
import { useLanguage } from '../../contexts/LanguageContext';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{group.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${group.success_rate >= 80 ? 'bg-green-100 text-green-800' :
                group.success_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                group.total_sessions === 0 ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'}`}>
              {group.total_sessions === 0 ? t('groups.noSessions') : `${group.success_rate}% ${t('groups.successRate').toLowerCase()}`}
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">{t('groups.words')}</div>
            <div className="mt-1 text-2xl font-semibold text-blue-600">{group.word_count}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-sm font-medium text-purple-800">{t('groups.sessions')}</div>
            <div className="mt-1 text-2xl font-semibold text-purple-600">{group.total_sessions}</div>
          </div>
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <div className="text-sm font-medium text-indigo-800">{t('groups.lastStudied')}</div>
            <div className="mt-1 text-sm font-medium text-indigo-600">
              {group.last_studied_at ? new Date(group.last_studied_at).toLocaleDateString() : t('groups.never')}
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Link
            to={`/groups/${group.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('groups.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  );
} 