import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { words } from '../lib/api';
import type { Word } from '../types/api';

export function WordDetails() {
  const { id } = useParams<{ id: string }>();
  const wordId = parseInt(id || '0');

  const { data: word, isLoading } = useQuery<Word>({
    queryKey: ['word', wordId],
    queryFn: () => words.getById(wordId)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-500">Word not found</div>
      </div>
    );
  }

  const totalAttempts = word.correct_count + word.wrong_count;
  const successRate = totalAttempts > 0 
    ? Math.round((word.correct_count / totalAttempts) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Word Details</h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">English</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{word.english}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Spanish</dt>
              <dd className="mt-1 text-lg font-semibold text-gray-900">{word.spanish}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Study Progress</h3>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">Correct</div>
                <div className="mt-1 text-2xl font-semibold text-green-600">{word.correct_count}</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-sm font-medium text-red-800">Wrong</div>
                <div className="mt-1 text-2xl font-semibold text-red-600">{word.wrong_count}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Success Rate</div>
                <div className="mt-1 text-2xl font-semibold text-blue-600">
                  {totalAttempts === 0 ? '-' : `${successRate}%`}
                </div>
              </div>
            </div>
          </div>

          {word.groups && word.groups.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Groups</h3>
              <div className="flex flex-wrap gap-2">
                {word.groups.map(group => (
                  <a
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                  >
                    {group.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 