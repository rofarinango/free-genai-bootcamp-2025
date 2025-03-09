import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sessions } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export function Settings() {
  const queryClient = useQueryClient();
  const { language, setLanguage, t } = useLanguage();
  const [isResetting, setIsResetting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLanguageChange = async (newLanguage: 'en' | 'es') => {
    setLanguage(newLanguage);
    setSaveMessage({
      type: 'success',
      text: t('settings.saveSuccess')
    });
  };

  const handleResetHistory = async () => {
    if (!window.confirm(t('settings.resetWarning'))) {
      return;
    }

    setIsResetting(true);
    setSaveMessage(null);

    try {
      await sessions.resetHistory();
      
      // Invalidate all queries to refetch fresh data
      await queryClient.invalidateQueries();
      
      setSaveMessage({
        type: 'success',
        text: t('settings.resetSuccess')
      });
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: t('settings.resetError')
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Language Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('settings.language')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.interfaceLanguage')}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'es')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reset History Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('settings.studyHistory')}</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('settings.resetWarning')}
                  </p>
                  <button
                    onClick={handleResetHistory}
                    disabled={isResetting}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResetting ? t('settings.resetting') : t('settings.resetHistory')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {saveMessage && (
            <div className="px-6 py-4 bg-gray-50">
              <p className={`text-sm ${
                saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {saveMessage.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 