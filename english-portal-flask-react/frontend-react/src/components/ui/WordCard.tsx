import { Link } from 'react-router-dom';
import type { Word } from '../../types/api';
import { useLanguage } from '../../contexts/LanguageContext';

interface WordCardProps {
  word: Word;
}

export function WordCard({ word }: WordCardProps) {
  const { t } = useLanguage();
  const totalAttempts = word.correct_count + word.wrong_count;
  const successRate = totalAttempts > 0 
    ? Math.round((word.correct_count / totalAttempts) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{word.english}</h3>
            <p className="text-sm text-gray-500 mt-1">{word.spanish}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${successRate >= 80 ? 'bg-green-100 text-green-800' :
                successRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                totalAttempts === 0 ? 'bg-gray-100 text-gray-800' :
                'bg-red-100 text-red-800'}`}>
              {totalAttempts === 0 ? t('common.noData') : `${successRate}% ${t('words.performance').toLowerCase()}`}
            </span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-800">{t('words.correct')}</div>
            <div className="mt-1 text-2xl font-semibold text-green-600">{word.correct_count}</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-sm font-medium text-red-800">{t('words.wrong')}</div>
            <div className="mt-1 text-2xl font-semibold text-red-600">{word.wrong_count}</div>
          </div>
        </div>
        
        {word.groups && word.groups.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">{t('words.groups')}:</div>
            <div className="flex flex-wrap gap-2">
              {word.groups.map(group => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  {group.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Link
            to={`/words/${word.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('studyActivities.viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  );
} 